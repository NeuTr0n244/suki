// Debug específico para carteira G75P14F1EgaFbKNqDgNc49SuQ9QhprsP8MQQeLuzHgyN
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const HELIUS_API_KEY = envContent.match(/HELIUS_API_KEY=(.*)/)?.[1]?.trim();
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Carteira do usuário
const WALLET = 'G75P14F1EgaFbKNqDgNc49SuQ9QhprsP8MQQeLuzHgyN';

async function fetchTransactions() {
  // Buscar TODAS as transações com paginação
  let allTxs = [];
  let lastSignature;
  let page = 0;

  while (page < 5) { // Buscar até 500 transações
    const url = `https://api.helius.xyz/v0/addresses/${WALLET}/transactions?api-key=${HELIUS_API_KEY}&limit=100${lastSignature ? '&before=' + lastSignature : ''}`;

    const res = await fetch(url);
    const txs = await res.json();

    if (!txs || txs.length === 0) break;

    allTxs.push(...txs);
    lastSignature = txs[txs.length - 1].signature;
    page++;

    console.log(`[DEBUG] Page ${page}: ${allTxs.length} total transactions`);

    if (txs.length < 100) break;

    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n[DEBUG] Fetched ${allTxs.length} total transactions\n`);

  const txs = allTxs;

  // Filtrar apenas SWAPs
  const swaps = txs.filter(tx => tx.type === 'SWAP');
  console.log(`[DEBUG] Found ${swaps.length} SWAP transactions\n`);

  // Primeiro, procurar SWAPs com WSOL entrando
  console.log('[DEBUG] Looking for SWAPs with WSOL/SOL coming IN...\n');

  let sellCount = 0;
  for (const tx of swaps) {
    // Verificar se tem WSOL entrando
    let hasWSOLIn = false;
    for (const tt of (tx.tokenTransfers || [])) {
      if (tt.mint === SOL_MINT && tt.toUserAccount === WALLET) {
        hasWSOLIn = true;
        console.log(`[FOUND WSOL IN] Signature: ${tx.signature.slice(0, 20)}...`);
        console.log(`  WSOL Amount: ${tt.tokenAmount.toFixed(6)} SOL`);
        console.log(`  From: ${tt.fromUserAccount?.slice(0, 12)}...`);
        console.log(`  To: ${tt.toUserAccount?.slice(0, 12)}...`);

        if (sellCount < 2) {
          console.log('\n[FULL JSON]:');
          console.log(JSON.stringify(tx, null, 2));
          console.log('\n---\n');
        }
        sellCount++;
        break;
      }
    }
  }

  console.log(`\n[DEBUG] Found ${sellCount} SWAPs with WSOL coming IN\n`);
  console.log('========================================\n');

  // Analisar primeiros 10 SWAPs
  let count = 0;
  let totalSolSpent = 0;
  let totalSolReceived = 0;

  for (const tx of swaps) {
    let solOut = 0;
    let solIn = 0;

    // Verificar TODAS as formas de receber SOL

    // 1. events.swap.nativeOutput
    if (tx.events?.swap?.nativeOutput) {
      const amount = tx.events.swap.nativeOutput.amount / 1e9;
      solIn += amount;
      console.log(`  [events.swap.nativeOutput] ${amount.toFixed(6)} SOL`);
    }

    // 2. events.swap.nativeInput
    if (tx.events?.swap?.nativeInput) {
      const amount = tx.events.swap.nativeInput.amount / 1e9;
      solOut += amount;
      console.log(`  [events.swap.nativeInput] ${amount.toFixed(6)} SOL`);
    }

    // 3. events.swap.tokenOutputs com SOL
    if (tx.events?.swap?.tokenOutputs) {
      for (const out of tx.events.swap.tokenOutputs) {
        if (out.mint === SOL_MINT) {
          const decimals = out.rawTokenAmount?.decimals || 9;
          const amount = (out.rawTokenAmount?.tokenAmount || out.amount) / Math.pow(10, decimals);
          solIn += amount;
          console.log(`  [events.swap.tokenOutputs] ${amount.toFixed(6)} SOL`);
        }
      }
    }

    // 4. events.swap.tokenInputs com SOL
    if (tx.events?.swap?.tokenInputs) {
      for (const inp of tx.events.swap.tokenInputs) {
        if (inp.mint === SOL_MINT) {
          const decimals = inp.rawTokenAmount?.decimals || 9;
          const amount = (inp.rawTokenAmount?.tokenAmount || inp.amount) / Math.pow(10, decimals);
          solOut += amount;
          console.log(`  [events.swap.tokenInputs] ${amount.toFixed(6)} SOL`);
        }
      }
    }

    // 5. nativeTransfers
    for (const nt of (tx.nativeTransfers || [])) {
      if (nt.fromUserAccount === WALLET) {
        const amount = nt.amount / 1e9;
        solOut += amount;
        console.log(`  [nativeTransfers OUT] ${amount.toFixed(6)} SOL`);
      }
      if (nt.toUserAccount === WALLET) {
        const amount = nt.amount / 1e9;
        solIn += amount;
        console.log(`  [nativeTransfers IN] ${amount.toFixed(6)} SOL`);
      }
    }

    // 6. tokenTransfers com WSOL
    for (const tt of (tx.tokenTransfers || [])) {
      if (tt.mint === SOL_MINT) {
        if (tt.fromUserAccount === WALLET) {
          const amount = tt.tokenAmount;
          solOut += amount;
          console.log(`  [tokenTransfers WSOL OUT] ${amount.toFixed(6)} SOL`);
        }
        if (tt.toUserAccount === WALLET) {
          const amount = tt.tokenAmount;
          solIn += amount;
          console.log(`  [tokenTransfers WSOL IN] ${amount.toFixed(6)} SOL`);
        }
      }
    }

    // Subtrair fee do solOut
    const fee = (tx.fee || 5000) / 1e9;
    if (solOut > 0) {
      solOut = Math.max(0, solOut - fee);
    }

    if (solIn > 0 || solOut > 0) {
      console.log(`\n[SWAP ${count + 1}] Signature: ${tx.signature.slice(0, 16)}...`);
      console.log(`  SOL OUT (spent): ${solOut.toFixed(6)} SOL`);
      console.log(`  SOL IN (received): ${solIn.toFixed(6)} SOL`);
      console.log(`  Fee: ${fee.toFixed(6)} SOL`);

      if (tx.events?.swap) {
        console.log(`  Events.swap exists: YES`);
      } else {
        console.log(`  Events.swap exists: NO`);
      }

      totalSolSpent += solOut;
      totalSolReceived += solIn;

      count++;

      // Mostrar JSON completo das primeiras 3 vendas (solIn > 0)
      if (solIn > 0.01 && count <= 3) {
        console.log('\n  [FULL JSON for this SELL]:');
        console.log(JSON.stringify(tx, null, 2));
        console.log('\n  ---\n');
      }

      if (count >= 10) break;
    }
  }

  console.log(`\n\n========== FINAL TOTALS ==========`);
  console.log(`Total SOL Spent: ${totalSolSpent.toFixed(4)} SOL`);
  console.log(`Total SOL Received: ${totalSolReceived.toFixed(4)} SOL`);
  console.log(`Net PnL: ${(totalSolReceived - totalSolSpent).toFixed(4)} SOL`);
  console.log(`==================================\n`);
}

fetchTransactions().then(() => {
  console.log('[DEBUG] Done!');
  process.exit(0);
}).catch(error => {
  console.error('[DEBUG] Error:', error);
  process.exit(1);
});
