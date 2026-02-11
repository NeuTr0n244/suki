import { batchCheckPumpFun } from './token-info';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const SOL_MINT = 'So11111111111111111111111111111111111111112';

interface TokenBalance {
  mint: string;
  bought: number;
  sold: number;
  solSpent: number;
  solReceived: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  firstBuy: number;
  lastTrade: number;
  buyTxs: number;
  sellTxs: number;
}

interface WalletAnalysis {
  totalTokens: number;
  totalTrades: number;
  totalPnlUsd: number;
  totalInvestedUsd: number;
  totalReturnedUsd: number;
  winRate: number;
  tokens: Map<string, TokenBalance>;
  allTransactions: any[];
}

// Fetch ALL transactions with complete pagination
export async function getAllTransactions(wallet: string): Promise<any[]> {
  if (!HELIUS_API_KEY) {
    console.error('[Analysis] Helius API key not configured');
    return [];
  }

  const allTransactions: any[] = [];
  let before: string | undefined;
  let hasMore = true;

  console.log(`[Analysis] Fetching ALL transactions for ${wallet.slice(0, 4)}...${wallet.slice(-4)}`);

  while (hasMore) {
    try {
      const rpcBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [
          wallet,
          {
            limit: 1000,
            ...(before ? { before } : {}),
          },
        ],
      };

      const response = await fetch(`https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcBody),
      });

      if (!response.ok) {
        console.error('[Analysis] RPC error:', response.status);
        break;
      }

      const data = await response.json();
      const sigs = data.result || [];

      if (sigs.length === 0) {
        hasMore = false;
        break;
      }

      allTransactions.push(...sigs);
      before = sigs[sigs.length - 1].signature;

      console.log(`[Analysis] Fetched ${allTransactions.length} transaction signatures...`);

      // Continue until we get all transactions
      if (sigs.length < 1000) {
        hasMore = false;
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      console.error('[Analysis] Error fetching transactions:', error);
      break;
    }
  }

  console.log(`[Analysis] Total transactions: ${allTransactions.length}`);
  return allTransactions;
}

// Get parsed transaction details in batches
export async function getParsedTransactions(signatures: string[]): Promise<any[]> {
  if (!HELIUS_API_KEY) return [];

  const allParsed: any[] = [];
  const batchSize = 100;

  console.log(`[Analysis] Fetching parsed transactions for ${signatures.length} signatures...`);

  for (let i = 0; i < signatures.length; i += batchSize) {
    const batch = signatures.slice(i, i + batchSize);

    try {
      const response = await fetch(
        `https://api.helius.xyz/v0/transactions/?api-key=${HELIUS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: batch }),
        }
      );

      if (!response.ok) {
        console.error(`[Analysis] Batch ${Math.floor(i / batchSize) + 1} failed:`, response.status);
        continue;
      }

      const txData = await response.json();
      allParsed.push(...txData);

      console.log(`[Analysis] Parsed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(signatures.length / batchSize)}`);

      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    } catch (error) {
      console.error('[Analysis] Error parsing batch:', error);
    }
  }

  console.log(`[Analysis] Total parsed transactions: ${allParsed.length}`);
  return allParsed;
}

// Analyze transactions to build token balances
export function analyzeTransactions(transactions: any[], wallet: string): Map<string, TokenBalance> {
  const tokens = new Map<string, TokenBalance>();

  console.log(`[Analysis] Analyzing ${transactions.length} transactions...`);

  // Filter only SWAP transactions
  const swaps = transactions.filter(tx => tx.type === 'SWAP');
  console.log(`[Analysis] Found ${swaps.length} SWAP transactions`);

  let debugCount = 0;
  for (const tx of swaps) {
    if (!tx.tokenTransfers || tx.tokenTransfers.length === 0) continue;

    // DEBUG: Log first 3 swaps completely
    if (debugCount < 3) {
      console.log(`\n[DEBUG SWAP ${debugCount + 1}] Type: ${tx.type}`);
      console.log(`[DEBUG] tokenTransfers count: ${tx.tokenTransfers.length}`);
      console.log(`[DEBUG] nativeTransfers count: ${tx.nativeTransfers?.length || 0}`);
      debugCount++;
    }

    // Process each token in this swap
    for (const transfer of tx.tokenTransfers) {
      const mint = transfer.mint;
      if (!mint || mint === SOL_MINT) continue; // Skip SOL itself as a "token"

      // Initialize token if not exists
      if (!tokens.has(mint)) {
        tokens.set(mint, {
          mint,
          bought: 0,
          sold: 0,
          solSpent: 0,
          solReceived: 0,
          avgBuyPrice: 0,
          avgSellPrice: 0,
          firstBuy: tx.timestamp || 0,
          lastTrade: tx.timestamp || 0,
          buyTxs: 0,
          sellTxs: 0,
        });
      }

      const tokenData = tokens.get(mint)!;

      // Determine if this is a buy or sell based on token direction
      const isBuy = transfer.toUserAccount === wallet;
      const tokenAmount = Math.abs(transfer.tokenAmount || 0);

      // Find corresponding SOL movement (CRITICAL FIX)
      let solAmount = 0;

      // Check nativeTransfers for SOL movement
      if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
        for (const nt of tx.nativeTransfers) {
          if (isBuy) {
            // User bought token = SOL LEFT wallet (spent)
            if (nt.fromUserAccount === wallet) {
              const amount = (nt.amount || 0) / 1e9;
              solAmount += amount;
              if (debugCount <= 3) console.log(`[DEBUG] BUY: Found native SOL leaving wallet: ${amount.toFixed(6)} SOL`);
            }
          } else {
            // User sold token = SOL ENTERED wallet (received)
            if (nt.toUserAccount === wallet) {
              const amount = (nt.amount || 0) / 1e9;
              solAmount += amount;
              if (debugCount <= 3) console.log(`[DEBUG] SELL: Found native SOL entering wallet: ${amount.toFixed(6)} SOL`);
            }
          }
        }
      }

      // Also check tokenTransfers for WSOL (wrapped SOL)
      for (const t of tx.tokenTransfers) {
        if (t.mint === SOL_MINT) {
          if (isBuy) {
            // Buying token = WSOL left wallet
            if (t.fromUserAccount === wallet) {
              const amount = Math.abs(t.tokenAmount || 0);
              solAmount += amount;
              if (debugCount <= 3) console.log(`[DEBUG] BUY: Found WSOL leaving wallet: ${amount.toFixed(6)} SOL`);
            }
          } else {
            // Selling token = WSOL entered wallet
            if (t.toUserAccount === wallet) {
              const amount = Math.abs(t.tokenAmount || 0);
              solAmount += amount;
              if (debugCount <= 3) console.log(`[DEBUG] SELL: Found WSOL entering wallet: ${amount.toFixed(6)} SOL`);
            }
          }
        }
      }

      if (debugCount <= 3) {
        console.log(`[DEBUG] Token ${mint.slice(0, 8)}... ${isBuy ? 'BUY' : 'SELL'}: ${tokenAmount.toFixed(4)} tokens for ${solAmount.toFixed(6)} SOL`);
      }

      if (isBuy) {
        tokenData.bought += tokenAmount;
        tokenData.solSpent += solAmount;
        tokenData.buyTxs++;
        tokenData.avgBuyPrice = tokenData.bought > 0 ? tokenData.solSpent / tokenData.bought : 0;
      } else {
        tokenData.sold += tokenAmount;
        tokenData.solReceived += solAmount;
        tokenData.sellTxs++;
        tokenData.avgSellPrice = tokenData.sold > 0 ? tokenData.solReceived / tokenData.sold : 0;
      }

      tokenData.lastTrade = tx.timestamp || tokenData.lastTrade;
    }
  }

  console.log(`[Analysis] Found ${tokens.size} unique tokens`);

  // DEBUG: Show first 5 tokens with their totals
  let tokenDebugCount = 0;
  console.log('\n[DEBUG] First 5 tokens summary:');
  for (const [mint, data] of tokens) {
    if (tokenDebugCount >= 5) break;
    console.log(`[DEBUG] Token ${mint.slice(0, 8)}...:`);
    console.log(`  - SOL Spent: ${data.solSpent.toFixed(6)} SOL`);
    console.log(`  - SOL Received: ${data.solReceived.toFixed(6)} SOL`);
    console.log(`  - Buy TXs: ${data.buyTxs}, Sell TXs: ${data.sellTxs}`);
    console.log(`  - PnL: ${(data.solReceived - data.solSpent).toFixed(6)} SOL`);
    tokenDebugCount++;
  }

  return tokens;
}

// Get current prices from Jupiter
export async function getCurrentPrices(mints: string[]): Promise<Map<string, number>> {
  const prices = new Map<string, number>();

  if (mints.length === 0) return prices;

  try {
    // Jupiter Price API v6 supports up to 100 tokens per request
    const batchSize = 100;

    for (let i = 0; i < mints.length; i += batchSize) {
      const batch = mints.slice(i, i + batchSize);
      const ids = batch.join(',');

      const response = await fetch(`https://price.jup.ag/v6/price?ids=${ids}`);

      if (!response.ok) {
        console.error('[Jupiter] Price fetch failed:', response.status);
        continue;
      }

      const data = await response.json();

      if (data.data) {
        for (const mint in data.data) {
          const price = data.data[mint]?.price || 0;
          prices.set(mint, price);
        }
      }

      // Small delay
      await new Promise(r => setTimeout(r, 100));
    }

    console.log(`[Jupiter] Fetched prices for ${prices.size} tokens`);
  } catch (error) {
    console.error('[Jupiter] Error fetching prices:', error);
  }

  return prices;
}

// Get SOL price in USD
export async function getSolPriceUSD(): Promise<number> {
  try {
    const response = await fetch(`https://price.jup.ag/v6/price?ids=${SOL_MINT}`);
    if (!response.ok) return 0;

    const data = await response.json();
    const solPrice = data.data?.[SOL_MINT]?.price || 0;

    console.log(`[Jupiter] SOL price: $${solPrice}`);
    return solPrice;
  } catch (error) {
    console.error('[Jupiter] Error fetching SOL price:', error);
    return 0;
  }
}

// Transform to app format
export async function transformToAppFormat(analysis: WalletAnalysis, solPrice: number) {
  const allTokens: any[] = [];

  // Check which tokens are from Pump.fun
  const mints = Array.from(analysis.tokens.keys());
  console.log('[Analysis] Checking Pump.fun tokens...');
  const pumpFunTokens = await batchCheckPumpFun(mints);
  console.log(`[Analysis] Found ${Array.from(pumpFunTokens.values()).filter(v => v).length} Pump.fun tokens`);

  for (const [mint, tokenData] of analysis.tokens) {
    const pnlSol = (tokenData.solReceived - tokenData.solSpent);
    const pnlUsd = pnlSol * solPrice;
    const pnlPercent = tokenData.solSpent > 0 ? (pnlSol / tokenData.solSpent) * 100 : 0;
    const isPumpFun = pumpFunTokens.get(mint) || false;

    allTokens.push({
      address: mint,
      name: mint.slice(0, 4) + '...' + mint.slice(-4),
      symbol: mint.slice(0, 6),
      totalSolSpent: tokenData.solSpent,
      totalSolReceived: tokenData.solReceived,
      totalSpentUsd: tokenData.solSpent * solPrice,
      totalReceivedUsd: tokenData.solReceived * solPrice,
      pnlSol,
      pnlUsd,
      pnlPercent,
      trades: tokenData.buyTxs + tokenData.sellTxs,
      status: (tokenData.bought - tokenData.sold) > 0 ? 'holding' : 'sold',
      isRug: false,
      rugReason: '',
      isPumpFun,
    });
  }

  // Sort for top wins/losses
  const topWins = allTokens
    .filter(t => t.pnlUsd > 1)
    .sort((a, b) => b.pnlUsd - a.pnlUsd)
    .slice(0, 5);

  const topLosses = allTokens
    .filter(t => t.pnlUsd < -1)
    .sort((a, b) => a.pnlUsd - b.pnlUsd)
    .slice(0, 5);

  const profitable = allTokens.filter(t => t.pnlUsd > 0).length;
  const unprofitable = allTokens.filter(t => t.pnlUsd < 0).length;

  return {
    totalTokensTraded: analysis.totalTokens,
    totalTradesCount: analysis.totalTrades,
    totalSolSpent: analysis.totalInvestedUsd / solPrice,
    totalSolReceived: analysis.totalReturnedUsd / solPrice,
    totalInvestedUsd: analysis.totalInvestedUsd,
    totalReturnedUsd: analysis.totalReturnedUsd,
    totalCurrentValueUsd: analysis.totalInvestedUsd + analysis.totalPnlUsd,
    totalPnlSol: analysis.totalPnlUsd / solPrice,
    totalPnlUsd: analysis.totalPnlUsd,
    totalPnlPercent: analysis.totalInvestedUsd > 0
      ? (analysis.totalPnlUsd / analysis.totalInvestedUsd) * 100
      : 0,
    profitableTokens: profitable,
    unprofitableTokens: unprofitable,
    ruggedTokens: 0,
    deadTokens: 0,
    unknownTokens: 0,
    activeTokens: analysis.totalTokens,
    holdingTokens: allTokens.filter(t => t.status === 'holding').length,
    winRate: analysis.winRate,
    topWins,
    topLosses,
    allTokens,
    avgHoldTimeMinutes: 0,
    avgTokenAgeAtBuyHours: 0,
    paperHandsCount: 0,
    diamondHandsCount: 0,
    nightTradesPct: 0,
    activeDays: 0,
  };
}

// Calculate complete wallet analysis
export async function analyzeWallet(wallet: string): Promise<WalletAnalysis | null> {
  try {
    // Step 1: Get ALL transactions
    const allSignatures = await getAllTransactions(wallet);
    if (allSignatures.length === 0) {
      return null;
    }

    // Step 2: Get parsed transactions (limit to first 50k for better accuracy)
    const signaturesOnly = allSignatures.slice(0, 50000).map(s => s.signature);
    const parsedTxs = await getParsedTransactions(signaturesOnly);

    // Step 3: Analyze transactions to build token balances
    const tokens = analyzeTransactions(parsedTxs, wallet);

    // Step 4: Get current prices
    const mints = Array.from(tokens.keys());
    const [currentPrices, solPrice] = await Promise.all([
      getCurrentPrices(mints),
      getSolPriceUSD(),
    ]);

    // Step 5: Calculate PnL (SIMPLE: SOL Received - SOL Spent)
    let totalSolSpent = 0;
    let totalSolReceived = 0;
    let wins = 0;
    let losses = 0;

    for (const [mint, tokenData] of tokens) {
      // Simple PnL: SOL received from selling - SOL spent buying
      const tokenPnlSol = tokenData.solReceived - tokenData.solSpent;

      totalSolSpent += tokenData.solSpent;
      totalSolReceived += tokenData.solReceived;

      if (tokenPnlSol > 0) wins++;
      else if (tokenPnlSol < 0) losses++;
    }

    // Calculate totals in USD
    const totalInvestedUsd = totalSolSpent * solPrice;
    const totalReturnedUsd = totalSolReceived * solPrice;
    const totalPnlSol = totalSolReceived - totalSolSpent;
    const totalPnlUsd = totalPnlSol * solPrice;

    console.log(`[Analysis] Total SOL Spent: ${totalSolSpent.toFixed(4)} SOL ($${totalInvestedUsd.toFixed(2)})`);
    console.log(`[Analysis] Total SOL Received: ${totalSolReceived.toFixed(4)} SOL ($${totalReturnedUsd.toFixed(2)})`);
    console.log(`[Analysis] Net PnL: ${totalPnlSol.toFixed(4)} SOL ($${totalPnlUsd.toFixed(2)})`);

    const totalTrades = Array.from(tokens.values()).reduce((sum, t) => sum + t.buyTxs + t.sellTxs, 0);
    const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0;

    console.log(`[Analysis] Complete!`);
    console.log(`[Analysis] Total PnL: $${totalPnlUsd.toFixed(2)}`);
    console.log(`[Analysis] Total Trades: ${totalTrades}`);
    console.log(`[Analysis] Win Rate: ${winRate.toFixed(1)}%`);

    return {
      totalTokens: tokens.size,
      totalTrades,
      totalPnlUsd,
      totalInvestedUsd,
      totalReturnedUsd,
      winRate,
      tokens,
      allTransactions: parsedTxs,
    };
  } catch (error) {
    console.error('[Analysis] Error:', error);
    return null;
  }
}
