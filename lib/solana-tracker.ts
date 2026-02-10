const SOLANA_TRACKER_API_KEY = process.env.SOLANA_TRACKER_API_KEY;

interface TokenPnL {
  holding: number;
  held: number;
  sold: number;
  sold_usd: number;
  realized: number;
  unrealized: number;
  total: number;
  total_invested: number;
  average_buy_amount: number;
  current_value: number;
  cost_basis: number;
  first_buy_time: number;
  last_buy_time: number;
  last_sell_time?: number;
  last_trade_time: number;
  buy_transactions: number;
  sell_transactions: number;
  total_transactions: number;
}

interface PnLSummary {
  realized: number;
  unrealized: number;
  total: number;
  totalInvested: number;
  averageBuyAmount: number;
  totalWins: number;
  totalLosses: number;
  winPercentage: number;
  lossPercentage: number;
}

interface WalletPnLResponse {
  tokens: Record<string, TokenPnL>;
  summary: PnLSummary;
}

export async function getWalletPnL(wallet: string): Promise<WalletPnLResponse | null> {
  if (!SOLANA_TRACKER_API_KEY) {
    console.error('[SolanaTracker] API key not configured');
    return null;
  }

  try {
    console.log(`[SolanaTracker] Fetching PnL for wallet ${wallet.slice(0, 4)}...${wallet.slice(-4)}`);

    const response = await fetch(
      `https://data.solanatracker.io/pnl/${wallet}?holdingCheck=true`,
      {
        headers: {
          'x-api-key': SOLANA_TRACKER_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SolanaTracker] API error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    console.log(`[SolanaTracker] PnL fetched successfully`);
    console.log(`[SolanaTracker] Summary:`, JSON.stringify(data.summary, null, 2));

    return data;
  } catch (error: any) {
    console.error('[SolanaTracker] Fetch error:', error.message);
    return null;
  }
}

// Transform Solana Tracker data to our format
export function transformToOurFormat(pnlData: WalletPnLResponse, solPrice: number) {
  const { tokens, summary } = pnlData;

  // Convert token data to our format
  const allTokens = Object.entries(tokens).map(([address, data]) => {
    const pnlUsd = data.total;
    const pnlSol = pnlUsd / solPrice;
    const pnlPercent = data.total_invested > 0
      ? ((data.total / data.total_invested) * 100) - 100
      : 0;

    return {
      address,
      name: address.slice(0, 4) + '...' + address.slice(-4), // Will be enhanced with actual token names
      symbol: address.slice(0, 6),
      totalSolSpent: data.total_invested / solPrice,
      totalSolReceived: (data.total_invested + data.realized) / solPrice,
      totalSpentUsd: data.total_invested,
      totalReceivedUsd: data.total_invested + data.realized,
      pnlSol,
      pnlUsd,
      pnlPercent,
      trades: data.total_transactions,
      status: data.holding > 0 ? 'holding' : 'sold',
      isRug: false,
      rugReason: '',
    };
  });

  // Sort for top wins/losses
  const topWins = allTokens
    .filter((t) => t.pnlUsd > 1)
    .sort((a, b) => b.pnlUsd - a.pnlUsd)
    .slice(0, 5);

  const topLosses = allTokens
    .filter((t) => t.pnlUsd < -1)
    .sort((a, b) => a.pnlUsd - b.pnlUsd)
    .slice(0, 5);

  return {
    totalTokensTraded: Object.keys(tokens).length,
    totalTradesCount: allTokens.reduce((sum, t) => sum + t.trades, 0),
    totalSolSpent: summary.totalInvested / solPrice,
    totalSolReceived: (summary.totalInvested + summary.realized) / solPrice,
    totalInvestedUsd: summary.totalInvested,
    totalReturnedUsd: summary.totalInvested + summary.realized,
    totalCurrentValueUsd: summary.totalInvested + summary.total,
    totalPnlSol: summary.total / solPrice,
    totalPnlUsd: summary.total,
    totalPnlPercent: summary.totalInvested > 0
      ? ((summary.total / summary.totalInvested) * 100)
      : 0,
    profitableTokens: summary.totalWins,
    unprofitableTokens: summary.totalLosses,
    ruggedTokens: 0,
    deadTokens: 0,
    unknownTokens: 0,
    activeTokens: Object.keys(tokens).length,
    holdingTokens: allTokens.filter(t => t.status === 'holding').length,
    winRate: summary.winPercentage,
    topWins,
    topLosses,
    allTokens,
    avgHoldTimeMinutes: 0, // Not provided by API
    avgTokenAgeAtBuyHours: 0, // Not provided by API
    paperHandsCount: 0, // Not provided by API
    diamondHandsCount: 0, // Not provided by API
    nightTradesPct: 0, // Not provided by API
    activeDays: 0, // Not provided by API
  };
}
