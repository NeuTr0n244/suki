// Testar events.swap nas transações SWAP
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const HELIUS_API_KEY = envContent.match(/HELIUS_API_KEY=(.*)/)?.[1]?.trim();
const WALLET = 'G75P14F1EgaFbKNqDgNc49SuQ9QhprsP8MQQeLuzHgyN';

async function test() {
  console.log('\n[TEST] Buscando transações SWAP com paginação...\n');

  let allTxs = [];
  let lastSignature;
  let page = 0;

  while (page < 5) { // Buscar 500 transações
    const url = `https://api.helius.xyz/v0/addresses/${WALLET}/transactions?api-key=${HELIUS_API_KEY}&type=SWAP&limit=100${lastSignature ? '&before=' + lastSignature : ''}`;

    const res = await fetch(url);
    const txs = await res.json();

    if (!txs || txs.length === 0) break;

    allTxs.push(...txs);
    lastSignature = txs[txs.length - 1].signature;
    page++;

    console.log(`[TEST] Page ${page}: ${allTxs.length} total SWAPs`);

    if (txs.length < 100) break;
    await new Promise(r => setTimeout(r, 100));
  }

  const txs = allTxs;
  console.log(`\n[TEST] Total de SWAPs: ${txs.length}\n`);

  let withEvents = 0;
  let withoutEvents = 0;
  let totalSpent = 0;
  let totalReceived = 0;

  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    const swap = tx.events?.swap;

    if (swap) {
      withEvents++;

      // Log das primeiras 3 transações COM events.swap
      if (withEvents <= 3) {
        console.log(`[SWAP ${withEvents}] Signature: ${tx.signature.slice(0, 20)}...`);
        console.log('events.swap:', JSON.stringify(swap, null, 2));
        console.log('---\n');
      }

      // Calcular usando APENAS events.swap
      const nativeIn = swap.nativeInput?.amount || 0;
      const nativeOut = swap.nativeOutput?.amount || 0;

      if (nativeIn > 0) {
        totalSpent += nativeIn / 1e9;
        if (withEvents <= 5) console.log(`  → SOL GASTO: ${(nativeIn / 1e9).toFixed(6)} SOL`);
      }

      if (nativeOut > 0) {
        totalReceived += nativeOut / 1e9;
        if (withEvents <= 5) console.log(`  → SOL RECEBIDO: ${(nativeOut / 1e9).toFixed(6)} SOL`);
      }
    } else {
      withoutEvents++;

      // Log das primeiras 3 transações SEM events.swap
      if (withoutEvents <= 3) {
        console.log(`[SWAP SEM EVENT ${withoutEvents}] Signature: ${tx.signature.slice(0, 20)}...`);
        console.log('  NO events.swap - seria necessário fallback');
        console.log('---\n');
      }
    }
  }

  console.log('\n========== ESTATÍSTICAS ==========');
  console.log(`Total SWAPs:          ${txs.length}`);
  console.log(`Com events.swap:      ${withEvents} (${((withEvents / txs.length) * 100).toFixed(1)}%)`);
  console.log(`Sem events.swap:      ${withoutEvents} (${((withoutEvents / txs.length) * 100).toFixed(1)}%)`);
  console.log('==================================\n');

  console.log('========== RESULTADOS ==========');
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
  } else {
    console.log(`❌ PnL ainda incorreto (diferença de ${diff.toFixed(2)} SOL)`);
  }
}

test().then(() => {
  console.log('\n[TEST] Done!');
  process.exit(0);
}).catch(error => {
  console.error('[TEST] Error:', error);
  process.exit(1);
});
