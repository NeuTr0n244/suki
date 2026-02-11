// Testar usando accountData.nativeBalanceChange
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const HELIUS_API_KEY = envContent.match(/HELIUS_API_KEY=(.*)/)?.[1]?.trim();
const WALLET = 'G75P14F1EgaFbKNqDgNc49SuQ9QhprsP8MQQeLuzHgyN';

async function test() {
  console.log('\n[TEST] Testando accountData.nativeBalanceChange...\n');

  let allTxs = [];
  let lastSignature;

  for (let page = 0; page < 5; page++) {
    const url = `https://api.helius.xyz/v0/addresses/${WALLET}/transactions?api-key=${HELIUS_API_KEY}&type=SWAP&limit=100${lastSignature ? '&before=' + lastSignature : ''}`;

    const res = await fetch(url);
    const txs = await res.json();

    if (!txs || txs.length === 0) break;

    allTxs.push(...txs);
    lastSignature = txs[txs.length - 1].signature;

    if (txs.length < 100) break;
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`[TEST] Total SWAPs: ${allTxs.length}\n`);

  let totalSpent = 0;
  let totalReceived = 0;

  for (let i = 0; i < allTxs.length; i++) {
    const tx = allTxs[i];

    // Encontrar o nativeBalanceChange da carteira do usuário
    for (const acc of (tx.accountData || [])) {
      if (acc.account === WALLET) {
        const change = acc.nativeBalanceChange / 1e9;

        if (i < 5) {
          console.log(`[SWAP ${i + 1}] ${tx.signature.slice(0, 20)}...`);
          console.log(`  nativeBalanceChange: ${change.toFixed(6)} SOL`);
        }

        // Se perdeu SOL (negativo) = compra (gasto)
        if (change < 0) {
          totalSpent += Math.abs(change);
          if (i < 5) console.log(`  → COMPRA: gastou ${Math.abs(change).toFixed(6)} SOL\n`);
        }
        // Se ganhou SOL (positivo) = venda (recebeu)
        else if (change > 0) {
          totalReceived += change;
          if (i < 5) console.log(`  → VENDA: recebeu ${change.toFixed(6)} SOL\n`);
        }

        break;
      }
    }
  }

  console.log('\n========== RESULTADOS ==========');
  console.log(`Total SOL Spent:      ${totalSpent.toFixed(4)} SOL`);
  console.log(`Total SOL Received:   ${totalReceived.toFixed(4)} SOL`);
  console.log(`Net PnL:              ${(totalReceived - totalSpent).toFixed(4)} SOL`);
  console.log('================================\n');

  console.log('ESPERADO: Spent ~56 SOL | Received ~48 SOL | PnL ~-8 SOL');
  console.log(`OBTIDO:   Spent ${totalSpent.toFixed(2)} SOL | Received ${totalReceived.toFixed(2)} SOL | PnL ${(totalReceived - totalSpent).toFixed(2)} SOL\n`);

  const expectedPnL = -8;
  const diff = Math.abs((totalReceived - totalSpent) - expectedPnL);

  if (diff < 2) {
    console.log(`✅ PnL CORRETO! (diferença de apenas ${diff.toFixed(2)} SOL)`);
    return true;
  } else {
    console.log(`❌ PnL ainda incorreto (diferença de ${diff.toFixed(2)} SOL)`);
    return false;
  }
}

test().then((success) => {
  console.log('\n[TEST] Done!');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('[TEST] Error:', error);
  process.exit(1);
});
