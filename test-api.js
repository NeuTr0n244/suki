// Testar a API diretamente sem servidor
const fs = require('fs');

// Simular environment
process.env.HELIUS_API_KEY = fs.readFileSync('.env.local', 'utf8').match(/HELIUS_API_KEY=(.*)/)?.[1]?.trim();

const WALLET = 'G75P14F1EgaFbKNqDgNc49SuQ9QhprsP8MQQeLuzHgyN';

async function test() {
  console.log('\n[TEST] Importing analyzer...\n');

  // Dinamicamente importar o módulo ES
  const analyzerModule = await import('./lib/wallet-analyzer.ts');
  const { analyzeWalletNew } = analyzerModule;

  console.log('[TEST] Running analysis...\n');

  const result = await analyzeWalletNew(WALLET);

  if (!result) {
    console.log('[TEST] ❌ Analysis failed!');
    return;
  }

  console.log('\n\n========== RESULTADOS FINAIS ==========');
  console.log(`Total SOL Spent:    ${result.totalSolSpent.toFixed(4)} SOL`);
  console.log(`Total SOL Received: ${result.totalSolReceived.toFixed(4)} SOL`);
  console.log(`Net PnL:            ${result.totalPnlSol.toFixed(4)} SOL`);
  console.log(`Win Rate:           ${result.winRate.toFixed(1)}%`);
  console.log(`Tokens Traded:      ${result.totalTokensTraded}`);
  console.log(`=======================================\n`);

  console.log('AXIOM (correto): Spent ~56 SOL | Received ~48 SOL | PnL ~-8 SOL');
  console.log(`SUKI (atual):    Spent ${result.totalSolSpent.toFixed(2)} SOL | Received ${result.totalSolReceived.toFixed(2)} SOL | PnL ${result.totalPnlSol.toFixed(2)} SOL\n`);

  const expectedPnL = -8;
  const diff = Math.abs(result.totalPnlSol - expectedPnL);

  if (diff < 2) {
    console.log(`✅ PnL está próximo do esperado! (diferença de apenas ${diff.toFixed(2)} SOL)`);
  } else {
    console.log(`❌ PnL ainda está incorreto (diferença de ${diff.toFixed(2)} SOL do esperado)`);
  }
}

test().catch(error => {
  console.error('\n[TEST] ❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
