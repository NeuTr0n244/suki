const SOL = 'So11111111111111111111111111111111111111112';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const STABLES = [SOL, USDC];

type TokenStatus = 'sold' | 'holding' | 'rugged' | 'unknown' | 'dead' | 'active';

interface SwapResult {
  mint: string;
  action: 'buy' | 'sell';
  solAmount: number;
  tokenAmount: number;
}

function processSwap(swap: any, walletAddress: string): SwapResult[] {
  const tokenTransfers = swap.tokenTransfers || [];
  const nativeTransfers = swap.nativeTransfers || [];

  const results: SwapResult[] = [];
  const processedMints = new Set<string>();

  for (const transfer of tokenTransfers) {
    const mint = transfer.mint;
    if (!mint || STABLES.includes(mint) || processedMints.has(mint)) continue;
    processedMints.add(mint);

    const tokenAmount = Math.abs(transfer.tokenAmount || 0);

    // Find corresponding SOL movement
    let solAmount = 0;
    for (const nt of nativeTransfers) {
      if (nt.fromUserAccount === walletAddress || nt.toUserAccount === walletAddress) {
        solAmount = Math.abs(nt.amount || 0) / 1e9;
        break;
      }
    }

    // Determine direction
    if (transfer.toUserAccount === walletAddress) {
      // Token came TO user = BUY (user spent SOL to get token)
      results.push({ mint, action: 'buy', solAmount, tokenAmount });
    } else if (transfer.fromUserAccount === walletAddress) {
      // Token left user = SELL (user sold token for SOL)
      results.push({ mint, action: 'sell', solAmount, tokenAmount });
    }
  }

  return results;
}

function isRug(tokenData: any | undefined): { isRug: boolean; reason: string; status: TokenStatus } {
  // No data on DexScreener — could be rug OR just a very small token
  if (!tokenData) {
    return { isRug: false, reason: 'No DexScreener data', status: 'unknown' };
  }

  // Confirmed rug indicators:
  if (tokenData.liquidity !== undefined && tokenData.liquidity < 100 && (tokenData.volume24h || 0) === 0) {
    return { isRug: true, reason: 'Dead liquidity + no volume', status: 'rugged' };
  }

  if ((tokenData.priceUsd || 0) === 0 && (tokenData.liquidity || 0) < 50) {
    return { isRug: true, reason: 'Zero price + no liquidity', status: 'rugged' };
  }

  // Dead token (very low activity)
  if ((tokenData.liquidity || 0) < 200 && (tokenData.volume24h || 0) < 10) {
    return { isRug: false, reason: 'Very low liquidity/volume', status: 'dead' };
  }

  // Low liquidity but still has some activity
  if ((tokenData.liquidity || 0) < 500 && (tokenData.volume24h || 0) > 0) {
    return { isRug: false, reason: 'Low liquidity but active', status: 'active' };
  }

  return { isRug: false, reason: 'Active token', status: 'active' };
}

function getTokenName(
  address: string,
  dexData: any,
  heliusMeta: Map<string, { name: string; symbol: string }>
): { name: string; symbol: string } {
  // Priority 1: DexScreener data
  if (dexData?.name && dexData.name !== 'Unknown') {
    return { name: dexData.name, symbol: dexData.symbol || dexData.name.slice(0, 6) };
  }

  // Priority 2: Helius transaction metadata
  const meta = heliusMeta.get(address);
  if (meta?.name) {
    return { name: meta.name, symbol: meta.symbol || meta.name.slice(0, 6) };
  }

  // Priority 3: Truncated address (last resort)
  return {
    name: address.slice(0, 4) + '...' + address.slice(-4),
    symbol: address.slice(0, 6),
  };
}

export function calculateMetrics(
  swaps: any[],
  tokenData: Map<string, any>,
  solPrice: number,
  walletAddress: string,
  tokenMeta: Map<string, { name: string; symbol: string }>
) {
  const tokenMap = new Map<
    string,
    {
      buys: any[];
      sells: any[];
      totalSolSpent: number;
      totalSolReceived: number;
      timestamps: number[];
    }
  >();

  // Process each swap
  for (const swap of swaps) {
    const processed = processSwap(swap, walletAddress);

    for (const result of processed) {
      if (!tokenMap.has(result.mint)) {
        tokenMap.set(result.mint, {
          buys: [],
          sells: [],
          totalSolSpent: 0,
          totalSolReceived: 0,
          timestamps: [],
        });
      }

      const data = tokenMap.get(result.mint)!;
      data.timestamps.push(swap.timestamp);

      if (result.action === 'buy') {
        data.buys.push({
          solAmount: result.solAmount,
          tokenAmount: result.tokenAmount,
          timestamp: swap.timestamp,
        });
        data.totalSolSpent += result.solAmount;
      } else {
        data.sells.push({
          solAmount: result.solAmount,
          tokenAmount: result.tokenAmount,
          timestamp: swap.timestamp,
        });
        data.totalSolReceived += result.solAmount;
      }
    }
  }

  // Calculate metrics for each token
  const allTokens: any[] = [];
  let totalSolSpent = 0;
  let totalSolReceived = 0;
  let confirmedRugs = 0;
  let deadTokens = 0;
  let unknownTokens = 0;
  let activeTokens = 0;
  let profitable = 0;
  let unprofitable = 0;
  let holding = 0;
  let paperHands = 0;
  let diamondHands = 0;
  let holdTimes: number[] = [];
  let tokenAges: number[] = [];

  for (const [token, data] of tokenMap) {
    const dexData = tokenData.get(token);
    const rugCheck = isRug(dexData);
    const { name, symbol } = getTokenName(token, dexData, tokenMeta);

    // PnL in SOL
    const pnlSol = data.totalSolReceived - data.totalSolSpent;
    const pnlPercent = data.totalSolSpent > 0 ? (pnlSol / data.totalSolSpent) * 100 : 0;
    const cappedPercent = Math.max(-100, Math.min(pnlPercent, 999999));

    // PnL in USD (approximate)
    const pnlUsd = pnlSol * solPrice;
    const investedUsd = data.totalSolSpent * solPrice;
    const receivedUsd = data.totalSolReceived * solPrice;

    // Count by status
    if (rugCheck.status === 'rugged') confirmedRugs++;
    else if (rugCheck.status === 'dead') deadTokens++;
    else if (rugCheck.status === 'unknown') unknownTokens++;
    else if (rugCheck.status === 'active') activeTokens++;

    // Determine if holding
    const isHolding = data.totalSolSpent > data.totalSolReceived * 1.5;
    if (isHolding) holding++;

    // Count profitable/unprofitable
    if (pnlSol > 0) profitable++;
    else unprofitable++;

    // Hold time
    const timestamps = data.timestamps.sort();
    const holdTime = timestamps.length > 1 ? (timestamps[timestamps.length - 1] - timestamps[0]) / 60000 : 0;
    holdTimes.push(holdTime);
    if (holdTime < 5) paperHands++;
    if (holdTime > 1440) diamondHands++;

    // Token age at first buy
    if (dexData?.pairCreatedAt && timestamps[0]) {
      const age = (timestamps[0] - dexData.pairCreatedAt) / 3600000;
      if (age > 0 && age < 8760) tokenAges.push(age);
    }

    totalSolSpent += data.totalSolSpent;
    totalSolReceived += data.totalSolReceived;

    allTokens.push({
      address: token,
      name,
      symbol,
      totalSolSpent: data.totalSolSpent,
      totalSolReceived: data.totalSolReceived,
      totalSpentUsd: investedUsd,
      totalReceivedUsd: receivedUsd,
      pnlSol,
      pnlUsd,
      pnlPercent: cappedPercent,
      trades: data.buys.length + data.sells.length,
      status: rugCheck.status,
      isRug: rugCheck.isRug,
      rugReason: rugCheck.reason,
    });
  }

  // Sort and get top trades by absolute SOL profit
  const topWins = allTokens
    .filter((t) => t.pnlSol > 0.01)
    .sort((a, b) => b.pnlSol - a.pnlSol)
    .slice(0, 5);

  const topLosses = allTokens
    .filter((t) => t.pnlSol < -0.01)
    .sort((a, b) => a.pnlSol - b.pnlSol)
    .slice(0, 5);

  // Night trades
  const nightTrades = swaps.filter((s: any) => {
    const h = new Date(s.timestamp).getUTCHours();
    return h >= 0 && h < 6;
  });

  // Active days
  const days = new Set(swaps.map((s: any) => new Date(s.timestamp).toISOString().split('T')[0]));

  // Helper functions
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

  // Total PnL
  const totalPnlSol = totalSolReceived - totalSolSpent;
  const totalPnlUsd = totalPnlSol * solPrice;
  const totalPnlPercent = totalSolSpent > 0 ? (totalPnlSol / totalSolSpent) * 100 : 0;

  return {
    totalTokensTraded: tokenMap.size,
    totalTradesCount: swaps.length,
    totalSolSpent,
    totalSolReceived,
    totalInvestedUsd: totalSolSpent * solPrice,
    totalReturnedUsd: totalSolReceived * solPrice,
    totalCurrentValueUsd: 0, // Not tracking current holdings for simplicity
    totalPnlSol,
    totalPnlUsd,
    totalPnlPercent,
    profitableTokens: profitable,
    unprofitableTokens: unprofitable,
    ruggedTokens: confirmedRugs,
    deadTokens,
    unknownTokens,
    activeTokens,
    holdingTokens: holding,
    winRate: allTokens.length > 0 ? (profitable / allTokens.length) * 100 : 0,
    topWins,
    topLosses,
    allTokens,
    avgHoldTimeMinutes: avg(holdTimes),
    avgTokenAgeAtBuyHours: avg(tokenAges),
    paperHandsCount: paperHands,
    diamondHandsCount: diamondHands,
    nightTradesPct: swaps.length ? (nightTrades.length / swaps.length) * 100 : 0,
    activeDays: days.size,
  };
}
