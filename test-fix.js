// Testar com a carteira específica
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const HELIUS_API_KEY = envContent.match(/HELIUS_API_KEY=(.*)/)?.[1]?.trim();
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const WALLET = 'G75P14F1EgaFbKNqDgNc49SuQ9QhprsP8MQQeLuzHgyN';

async function test() {
  // Importar a nova função do analisador
  const { analyzeWalletNew } = await import('./lib/wallet-analyzer.ts');

  console.log('\n[TEST] Analisando carteira G75P14F1EgaFbKNqDgNc49SuQ9QhprsP8MQQeLuzHgyN...\n');

  const result = await analyzeWalletNew(WALLET);

  if (!result) {
    console.log('[TEST] Análise falhou!');
    return;
  }

  console.log('\n========== RESULTADOS FINAIS ==========');
  console.log(`Total SOL Spent:    ${result.totalSolSpent.toFixed(4)} SOL`);
  console.log(`Total SOL Received: ${result.totalSolReceived.toFixed(4)} SOL`);
  console.log(`Net PnL:            ${result.totalPnlSol.toFixed(4)} SOL`);
  console.log(`Win Rate:           ${result.winRate.toFixed(1)}%`);
  console.log(`Tokens Traded:      ${result.totalTokensTraded}`);
  console.log(`=======================================\n`);

  console.log('AXIOM (correto): Spent ~56 SOL | Received ~48 SOL | PnL ~-8 SOL');
  console.log(`SUKI (atual):    Spent ${result.totalSolSpent.toFixed(2)} SOL | Received ${result.totalSolReceived.toFixed(2)} SOL | PnL ${result.totalPnlSol.toFixed(2)} SOL\n`);

  const diff = Math.abs(result.totalPnlSol - (-8));
  if (diff < 2) {
    console.log('✅ PnL está próximo do esperado!');
  } else {
    console.log(`❌ PnL ainda está errado (diferença de ${diff.toFixed(2)} SOL)`);
  }
}

test().then(() => {
  console.log('\n[TEST] Done!');
  process.exit(0);
}).catch(error => {
  console.error('[TEST] Error:', error);
  process.exit(1);
});
