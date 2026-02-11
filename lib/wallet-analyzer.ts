// NOVA ANÁLISE DE CARTEIRA - REESCRITA COMPLETA DO ZERO
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const SOL_MINT = 'So11111111111111111111111111111111111111112';

interface TokenTrade {
  mint: string;
  symbol: string;
  name: string;
  solSpent: number;
  solReceived: number;
  pnl: number;
  pnlPercent: number;
  trades: number;
  status: 'win' | 'loss' | 'open';
}

interface AnalysisResult {
  totalSolSpent: number;
  totalSolReceived: number;
  netPnl: number;
  winRate: number;
  wins: number;
  losses: number;
  tokensTraded: number;
  tokens: TokenTrade[];
}

// Buscar TODAS as transações com paginação
async function fetchAllTransactions(wallet: string): Promise<any[]> {
  if (!HELIUS_API_KEY) {
    console.error('[Analyzer] Helius API key not found');
    return [];
  }

  const all: any[] = [];
  let lastSignature: string | undefined;
  let pageCount = 0;

  console.log(`[Analyzer] Fetching transactions for ${wallet.slice(0, 4)}...${wallet.slice(-4)}`);

  while (true) {
    try {
      const url = `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${HELIUS_API_KEY}&limit=100${lastSignature ? '&before=' + lastSignature : ''}`;

      const res = await fetch(url);
      if (!res.ok) {
        console.error(`[Analyzer] API error: ${res.status}`);
        break;
      }

      const txs = await res.json();

      if (!txs || txs.length === 0) break;

      all.push(...txs);
      lastSignature = txs[txs.length - 1].signature;
      pageCount++;

      console.log(`[Analyzer] Fetched page ${pageCount}: ${all.length} total transactions`);

      if (txs.length < 100) break;

      // Max 1000 transações para não demorar muito
      if (all.length >= 1000) {
        console.log('[Analyzer] Reached limit of 1000 transactions');
        break;
      }

      // Delay para evitar rate limit
      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      console.error('[Analyzer] Error fetching transactions:', error);
      break;
    }
  }

  console.log(`[Analyzer] Total transactions fetched: ${all.length}`);
  return all;
}

// Analisar transações e calcular PnL
function analyzeTransactions(txs: any[], wallet: string): AnalysisResult {
  let totalSolSpent = 0;
  let totalSolReceived = 0;
  const tokenMap = new Map<string, TokenTrade>();

  // Filtrar apenas SWAPs
  const swaps = txs.filter(tx => tx.type === 'SWAP');
  console.log(`[Analyzer] Processing ${swaps.length} SWAP transactions out of ${txs.length} total`);

  // DEBUG: Mostrar estrutura das primeiras 3 transações SWAP
  let debugCount = 0;

  for (const tx of swaps) {
    if (debugCount < 3) {
      console.log(`\n[DEBUG SWAP ${debugCount + 1}]`);
      console.log('Type:', tx.type);
      console.log('Events:', JSON.stringify(tx.events || {}, null, 2));
      console.log('nativeTransfers:', tx.nativeTransfers?.length || 0);
      console.log('tokenTransfers:', tx.tokenTransfers?.length || 0);
      console.log('Fee:', tx.fee);
      debugCount++;
    }

    let solOut = 0;
    let solIn = 0;
    let tokenMint = '';
    let tokenSymbol = '';
    let tokenName = '';

    // Método 1: Usar swap event se disponível (mais confiável)
    if (tx.events?.swap) {
      const swap = tx.events.swap;
      console.log('[Analyzer] Found swap event');

      const tokenIn = swap.tokenInputs?.[0] || swap.nativeInput;
      const tokenOut = swap.tokenOutputs?.[0] || swap.nativeOutput;

      if (debugCount <= 3) {
        console.log('[DEBUG] tokenIn:', tokenIn);
        console.log('[DEBUG] tokenOut:', tokenOut);
      }

      // Se gastou SOL/WSOL para comprar token
      if (tokenIn && (tokenIn.mint === SOL_MINT || !tokenIn.mint)) {
        const solAmount = (tokenIn.amount || tokenIn.rawTokenAmount?.tokenAmount || 0) / 1e9;
        solOut = solAmount;

        if (tokenOut) {
          tokenMint = tokenOut.mint || 'unknown';
          tokenSymbol = tokenOut.symbol || tokenMint.slice(0, 6);
          tokenName = tokenOut.name || tokenMint.slice(0, 8);
        }
      }

      // Se vendeu token para receber SOL/WSOL
      if (tokenOut && (tokenOut.mint === SOL_MINT || !tokenOut.mint)) {
        const solAmount = (tokenOut.amount || tokenOut.rawTokenAmount?.tokenAmount || 0) / 1e9;
        solIn = solAmount;

        if (tokenIn) {
          tokenMint = tokenIn.mint || 'unknown';
          tokenSymbol = tokenIn.symbol || tokenMint.slice(0, 6);
          tokenName = tokenIn.name || tokenMint.slice(0, 8);
        }
      }
    }

    // Método 2: Usar nativeTransfers + tokenTransfers (fallback)
    if (solOut === 0 && solIn === 0) {
      // Native SOL transfers
      for (const nt of (tx.nativeTransfers || [])) {
        if (nt.fromUserAccount === wallet) {
          solOut += nt.amount / 1e9;
        }
        if (nt.toUserAccount === wallet) {
          solIn += nt.amount / 1e9;
        }
      }

      // Token transfers (SOL wrapping/unwrapping + tokens)
      for (const tt of (tx.tokenTransfers || [])) {
        if (tt.mint === SOL_MINT) {
          if (tt.fromUserAccount === wallet) {
            solOut += tt.tokenAmount;
          }
          if (tt.toUserAccount === wallet) {
            solIn += tt.tokenAmount;
          }
        } else if (tt.fromUserAccount === wallet || tt.toUserAccount === wallet) {
          tokenMint = tt.mint;
          // Extrair símbolo e nome de accountData se disponível
          for (const acc of (tx.accountData || [])) {
            if (acc.tokenBalanceChanges) {
              for (const change of acc.tokenBalanceChanges) {
                if (change.mint === tokenMint) {
                  tokenSymbol = change.symbol || tokenMint.slice(0, 6);
                  tokenName = change.name || tokenMint.slice(0, 8);
                  break;
                }
              }
            }
          }
        }
      }

      // Subtrair fee (geralmente 0.000005 SOL)
      const fee = (tx.fee || 5000) / 1e9;
      solOut = Math.max(0, solOut - fee);
    }

    if (debugCount <= 3) {
      console.log(`[DEBUG] SOL OUT: ${solOut.toFixed(6)} SOL`);
      console.log(`[DEBUG] SOL IN: ${solIn.toFixed(6)} SOL`);
      console.log(`[DEBUG] Token: ${tokenMint.slice(0, 8)}...`);
    }

    // Processar compra (gastou SOL)
    if (solOut > 0.001 && tokenMint) {
      totalSolSpent += solOut;

      if (!tokenMap.has(tokenMint)) {
        tokenMap.set(tokenMint, {
          mint: tokenMint,
          symbol: tokenSymbol || tokenMint.slice(0, 6),
          name: tokenName || tokenMint.slice(0, 8),
          solSpent: 0,
          solReceived: 0,
          pnl: 0,
          pnlPercent: 0,
          trades: 0,
          status: 'open',
        });
      }

      const token = tokenMap.get(tokenMint)!;
      token.solSpent += solOut;
      token.trades++;

      if (debugCount <= 3) {
        console.log(`[DEBUG] BUY: ${tokenMint.slice(0, 8)}... for ${solOut.toFixed(6)} SOL`);
      }
    }

    // Processar venda (recebeu SOL)
    if (solIn > 0.001 && tokenMint) {
      totalSolReceived += solIn;

      if (!tokenMap.has(tokenMint)) {
        tokenMap.set(tokenMint, {
          mint: tokenMint,
          symbol: tokenSymbol || tokenMint.slice(0, 6),
          name: tokenName || tokenMint.slice(0, 8),
          solSpent: 0,
          solReceived: 0,
          pnl: 0,
          pnlPercent: 0,
          trades: 0,
          status: 'open',
        });
      }

      const token = tokenMap.get(tokenMint)!;
      token.solReceived += solIn;
      token.trades++;

      if (debugCount <= 3) {
        console.log(`[DEBUG] SELL: ${tokenMint.slice(0, 8)}... for ${solIn.toFixed(6)} SOL`);
      }
    }
  }

  // Calcular PnL por token
  let wins = 0;
  let losses = 0;

  for (const [mint, token] of tokenMap) {
    token.pnl = token.solReceived - token.solSpent;
    token.pnlPercent = token.solSpent > 0 ? ((token.solReceived - token.solSpent) / token.solSpent) * 100 : 0;

    if (token.solReceived > 0 && token.solSpent > 0) {
      token.status = token.pnl >= 0 ? 'win' : 'loss';
      if (token.pnl >= 0) wins++;
      else losses++;
    }
  }

  const netPnl = totalSolReceived - totalSolSpent;
  const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;

  console.log(`\n[Analyzer] FINAL RESULTS:`);
  console.log(`Total SOL Spent: ${totalSolSpent.toFixed(4)} SOL`);
  console.log(`Total SOL Received: ${totalSolReceived.toFixed(4)} SOL`);
  console.log(`Net PnL: ${netPnl.toFixed(4)} SOL`);
  console.log(`Win Rate: ${winRate.toFixed(1)}%`);
  console.log(`Tokens Traded: ${tokenMap.size}`);
  console.log(`Wins: ${wins}, Losses: ${losses}`);

  return {
    totalSolSpent: Math.round(totalSolSpent * 1000) / 1000,
    totalSolReceived: Math.round(totalSolReceived * 1000) / 1000,
    netPnl: Math.round(netPnl * 1000) / 1000,
    winRate: Math.round(winRate * 10) / 10,
    wins,
    losses,
    tokensTraded: tokenMap.size,
    tokens: Array.from(tokenMap.values()).sort((a, b) => b.pnl - a.pnl),
  };
}

// Get SOL price
async function getSolPrice(): Promise<number> {
  try {
    const res = await fetch('https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112');
    const data = await res.json();
    const price = data.data?.['So11111111111111111111111111111111111111112']?.price || 0;
    console.log(`[Analyzer] SOL Price: $${price}`);
    return price;
  } catch (error) {
    console.error('[Analyzer] Error fetching SOL price:', error);
    return 0;
  }
}

// Função principal de análise
export async function analyzeWalletNew(wallet: string) {
  try {
    console.log(`\n[Analyzer] Starting wallet analysis for ${wallet}`);

    // 1. Buscar todas as transações
    const allTxs = await fetchAllTransactions(wallet);

    if (allTxs.length === 0) {
      console.log('[Analyzer] No transactions found');
      return null;
    }

    // 2. Analisar transações
    const analysis = analyzeTransactions(allTxs, wallet);

    // 3. Buscar preço do SOL
    const solPrice = await getSolPrice();

    // 4. Converter para USD
    const result = {
      totalSolSpent: analysis.totalSolSpent,
      totalSolReceived: analysis.totalSolReceived,
      totalInvestedUsd: analysis.totalSolSpent * solPrice,
      totalReturnedUsd: analysis.totalSolReceived * solPrice,
      totalPnlSol: analysis.netPnl,
      totalPnlUsd: analysis.netPnl * solPrice,
      totalPnlPercent: analysis.totalSolSpent > 0
        ? ((analysis.netPnl / analysis.totalSolSpent) * 100)
        : 0,
      totalTokensTraded: analysis.tokensTraded,
      totalTradesCount: analysis.tokens.reduce((sum, t) => sum + t.trades, 0),
      winRate: analysis.winRate,
      profitableTokens: analysis.wins,
      unprofitableTokens: analysis.losses,
      allTokens: analysis.tokens.map(t => ({
        address: t.mint,
        name: t.name,
        symbol: t.symbol,
        totalSolSpent: t.solSpent,
        totalSolReceived: t.solReceived,
        totalSpentUsd: t.solSpent * solPrice,
        totalReceivedUsd: t.solReceived * solPrice,
        pnlSol: t.pnl,
        pnlUsd: t.pnl * solPrice,
        pnlPercent: t.pnlPercent,
        trades: t.trades,
        status: t.status === 'open' ? 'holding' : 'sold',
        isRug: false,
        rugReason: '',
      })),
      topWins: analysis.tokens
        .filter(t => t.pnl > 0.01)
        .sort((a, b) => b.pnl - a.pnl)
        .slice(0, 5)
        .map(t => ({
          address: t.mint,
          name: t.name,
          symbol: t.symbol,
          pnlSol: t.pnl,
          pnlUsd: t.pnl * solPrice,
        })),
      topLosses: analysis.tokens
        .filter(t => t.pnl < -0.01)
        .sort((a, b) => a.pnl - b.pnl)
        .slice(0, 5)
        .map(t => ({
          address: t.mint,
          name: t.name,
          symbol: t.symbol,
          pnlSol: t.pnl,
          pnlUsd: t.pnl * solPrice,
        })),
      // Placeholder values
      ruggedTokens: 0,
      deadTokens: 0,
      unknownTokens: 0,
      activeTokens: analysis.tokensTraded,
      holdingTokens: analysis.tokens.filter(t => t.status === 'open').length,
      avgHoldTimeMinutes: 0,
      avgTokenAgeAtBuyHours: 0,
      paperHandsCount: 0,
      diamondHandsCount: 0,
      nightTradesPct: 0,
      activeDays: 0,
      totalCurrentValueUsd: 0,
    };

    console.log('[Analyzer] Analysis complete!\n');
    return result;
  } catch (error) {
    console.error('[Analyzer] Fatal error:', error);
    return null;
  }
}
