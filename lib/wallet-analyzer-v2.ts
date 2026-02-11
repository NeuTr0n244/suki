// ANÁLISE DE CARTEIRA - Usando nativeBalanceChange (MÉTODO MAIS CONFIÁVEL)
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

// Buscar TODAS as transações SEM filtro (o filtro type=SWAP limita resultados)
async function fetchAllTransactions(wallet: string): Promise<any[]> {
  if (!HELIUS_API_KEY) {
    console.error('[Analyzer] Helius API key not found');
    return [];
  }

  const all: any[] = [];
  let lastSignature: string | undefined;

  console.log(`[Analyzer] Fetching transactions for ${wallet.slice(0, 4)}...${wallet.slice(-4)}`);

  for (let page = 0; page < 10; page++) {
    try {
      // NÃO usar filtro type=SWAP
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

      console.log(`[Analyzer] Page ${page + 1}: ${all.length} transactions`);

      if (txs.length < 100) break;
      if (all.length >= 1000) break; // Limite de 1000

      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      console.error('[Analyzer] Error:', error);
      break;
    }
  }

  console.log(`[Analyzer] Total transactions: ${all.length}`);
  return all;
}

// Analisar usando nativeBalanceChange (IGNORA nativeTransfers e tokenTransfers)
function analyzeTransactions(txs: any[], wallet: string): AnalysisResult {
  const swaps = txs.filter(tx => tx.type === 'SWAP');
  console.log(`[Analyzer] Found ${swaps.length} SWAPs`);

  let totalSolSpent = 0;
  let totalSolReceived = 0;
  const tokenMap = new Map<string, TokenTrade>();

  for (const tx of swaps) {
    // Encontrar nativeBalanceChange da carteira do usuário
    let balanceChange = 0;

    for (const acc of (tx.accountData || [])) {
      if (acc.account === wallet) {
        balanceChange = acc.nativeBalanceChange / 1e9;
        break;
      }
    }

    if (balanceChange === 0) continue;

    // Identificar o token traded
    let tokenMint = '';
    let tokenSymbol = '';
    let tokenName = '';

    for (const tt of (tx.tokenTransfers || [])) {
      if (tt.mint !== SOL_MINT && (tt.fromUserAccount === wallet || tt.toUserAccount === wallet)) {
        tokenMint = tt.mint;

        // Tentar extrair nome/símbolo
        for (const acc of (tx.accountData || [])) {
          for (const change of (acc.tokenBalanceChanges || [])) {
            if (change.mint === tokenMint) {
              tokenSymbol = tokenMint.slice(0, 6);
              tokenName = tokenMint.slice(0, 8);
              break;
            }
          }
        }
        break;
      }
    }

    if (!tokenMint) continue;

    // Inicializar token
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
    token.trades++;

    // balanceChange negativo = COMPRA (gastou SOL)
    if (balanceChange < 0) {
      const spent = Math.abs(balanceChange);
      totalSolSpent += spent;
      token.solSpent += spent;
    }
    // balanceChange positivo = VENDA (recebeu SOL)
    else if (balanceChange > 0) {
      totalSolReceived += balanceChange;
      token.solReceived += balanceChange;
    }
  }

  // Calcular PnL por token
  let wins = 0;
  let losses = 0;

  for (const [mint, token] of tokenMap) {
    token.pnl = token.solReceived - token.solSpent;
    token.pnlPercent = token.solSpent > 0 ? (token.pnl / token.solSpent) * 100 : 0;

    if (token.solReceived > 0 && token.solSpent > 0) {
      token.status = token.pnl >= 0 ? 'win' : 'loss';
      if (token.pnl >= 0) wins++;
      else losses++;
    }
  }

  const netPnl = totalSolReceived - totalSolSpent;
  const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;

  console.log(`[Analyzer] SOL Spent: ${totalSolSpent.toFixed(4)} SOL`);
  console.log(`[Analyzer] SOL Received: ${totalSolReceived.toFixed(4)} SOL`);
  console.log(`[Analyzer] Net PnL: ${netPnl.toFixed(4)} SOL`);
  console.log(`[Analyzer] Win Rate: ${winRate.toFixed(1)}%`);

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

// Função principal
export async function analyzeWalletNew(wallet: string) {
  try {
    console.log(`\n[Analyzer] Starting analysis for ${wallet}\n`);

    // 1. Buscar transações
    const allTxs = await fetchAllTransactions(wallet);
    if (allTxs.length === 0) {
      console.log('[Analyzer] No transactions found');
      return null;
    }

    // 2. Analisar
    const analysis = analyzeTransactions(allTxs, wallet);

    // 3. SOL price
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
        ? (analysis.netPnl / analysis.totalSolSpent) * 100
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
