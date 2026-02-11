// Script de teste para o novo analisador
const fs = require('fs');

// Ler .env.local manualmente
const envContent = fs.readFileSync('.env.local', 'utf8');
const HELIUS_API_KEY = envContent.match(/HELIUS_API_KEY=(.*)/)?.[1]?.trim();
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Carteira de exemplo com histórico de trades
const TEST_WALLET = '7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3';

async function fetchAllTransactions(wallet) {
  const all = [];
  let lastSignature;
  let pageCount = 0;

  console.log(`\n[TEST] Fetching transactions for ${wallet.slice(0, 4)}...${wallet.slice(-4)}\n`);

  while (true) {
    try {
      const url = `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${HELIUS_API_KEY}&limit=100${lastSignature ? '&before=' + lastSignature : ''}`;

      const res = await fetch(url);
      if (!res.ok) {
        console.error(`[TEST] API error: ${res.status}`);
        break;
      }

      const txs = await res.json();

      if (!txs || txs.length === 0) break;

      all.push(...txs);
      lastSignature = txs[txs.length - 1].signature;
      pageCount++;

      console.log(`[TEST] Page ${pageCount}: ${all.length} total transactions`);

      if (txs.length < 100) break;
      if (all.length >= 200) break; // Limit para teste

      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      console.error('[TEST] Error:', error);
      break;
    }
  }

  console.log(`\n[TEST] Total transactions: ${all.length}\n`);
  return all;
}

async function test() {
  const txs = await fetchAllTransactions(TEST_WALLET);

  // Filtrar SWAPs
  const swaps = txs.filter(tx => tx.type === 'SWAP');
  console.log(`[TEST] Found ${swaps.length} SWAP transactions\n`);

  if (swaps.length > 0) {
    console.log('[TEST] First SWAP structure:');
    console.log(JSON.stringify(swaps[0], null, 2));
    console.log('\n---\n');

    // Analisar primeira SWAP
    const firstSwap = swaps[0];
    console.log('[TEST] Analyzing first SWAP:');
    console.log('Type:', firstSwap.type);
    console.log('Events:', firstSwap.events ? Object.keys(firstSwap.events) : 'none');
    console.log('nativeTransfers:', firstSwap.nativeTransfers?.length || 0);
    console.log('tokenTransfers:', firstSwap.tokenTransfers?.length || 0);
    console.log('Fee:', firstSwap.fee);

    if (firstSwap.nativeTransfers) {
      console.log('\nNative Transfers:');
      firstSwap.nativeTransfers.forEach((nt, i) => {
        console.log(`  ${i + 1}. From: ${nt.fromUserAccount.slice(0, 8)}... To: ${nt.toUserAccount.slice(0, 8)}... Amount: ${(nt.amount / 1e9).toFixed(6)} SOL`);
      });
    }

    if (firstSwap.tokenTransfers) {
      console.log('\nToken Transfers:');
      firstSwap.tokenTransfers.forEach((tt, i) => {
        console.log(`  ${i + 1}. Mint: ${tt.mint.slice(0, 8)}... From: ${tt.fromUserAccount?.slice(0, 8) || 'none'}... To: ${tt.toUserAccount?.slice(0, 8) || 'none'}... Amount: ${tt.tokenAmount}`);
      });
    }
  }
}

test().then(() => {
  console.log('\n[TEST] Done!');
  process.exit(0);
}).catch(error => {
  console.error('[TEST] Fatal error:', error);
  process.exit(1);
});
