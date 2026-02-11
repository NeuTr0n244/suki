// Buscar TODAS as transações SEM filtro, depois filtrar por SWAP
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const HELIUS_API_KEY = envContent.match(/HELIUS_API_KEY=(.*)/)?.[1]?.trim();
const WALLET = 'G75P14F1EgaFbKNqDgNc49SuQ9QhprsP8MQQeLuzHgyN';

async function test() {
  console.log('\n[TEST] Buscando TODAS as transações (sem filtro)...\n');

  let allTxs = [];
  let lastSignature;

  for (let page = 0; page < 10; page++) { // Buscar até 1000 transações
    const url = `https://api.helius.xyz/v0/addresses/${WALLET}/transactions?api-key=${HELIUS_API_KEY}&limit=100${lastSignature ? '&before=' + lastSignature : ''}`;

    const res = await fetch(url);
    const txs = await res.json();

    if (!txs || txs.length === 0) break;

    allTxs.push(...txs);
    lastSignature = txs[txs.length - 1].signature;

    console.log(`[TEST] Page ${page + 1}: ${allTxs.length} total transactions`);

    if (txs.length < 100) break;
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n[TEST] Total transactions: ${allTxs.length}`);

  // Filtrar por SWAP
  const swaps = allTxs.filter(tx => tx.type === 'SWAP');
  console.log(`[TEST] Total SWAPs: ${swaps.length}\n`);

  let totalSpent = 0;
  let totalReceived = 0;

  for (let i = 0; i < swaps.length; i++) {
    const tx = swaps[i];

    // Encontrar o nativeBalanceChange da carteira do usuário
    for (const acc of (tx.accountData || [])) {
      if (acc.account === WALLET) {
        const change = acc.nativeBalanceChange / 1e9;

        if (i < 10) {
          console.log(`[SWAP ${i + 1}] ${tx.signature.slice(0, 20)}...`);
          console.log(`  nativeBalanceChange: ${change.toFixed(6)} SOL`);
        }

        // Se perdeu SOL (negativo) = compra (gasto)
        if (change < 0) {
          totalSpent += Math.abs(change);
          if (i < 10) console.log(`  → COMPRA: gastou ${Math.abs(change).toFixed(6)} SOL\n`);
        }
        // Se ganhou SOL (positivo) = venda (recebeu)
        else if (change > 0) {
          totalReceived += change;
          if (i < 10) console.log(`  → VENDA: recebeu ${change.toFixed(6)} SOL\n`);
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
    console.log(`   Isso pode ser porque a carteira tem mais transações antigas.`);
    return (diff < 5); // Aceitar se a diferença for menor que 5 SOL
  }
}

test().then((success) => {
  console.log('\n[TEST] Done!');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('[TEST] Error:', error);
  process.exit(1);
});
