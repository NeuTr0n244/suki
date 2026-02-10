// Pump.fun program ID
const PUMP_PROGRAM = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';

interface TokenInfo {
  isPumpFun: boolean;
  name?: string;
  symbol?: string;
  image?: string;
  marketCap?: number;
  creator?: string;
}

// Check if token is from Pump.fun
export async function isPumpFunToken(mintAddress: string): Promise<boolean> {
  try {
    const response = await fetch(`https://frontend-api-v2.pump.fun/coins/${mintAddress}`);

    if (response.ok) {
      const data = await response.json();
      return !!data; // If we get data back, it's a pump.fun token
    }

    return false;
  } catch (error) {
    return false;
  }
}

// Get token info from Pump.fun
export async function getPumpFunTokenInfo(mintAddress: string): Promise<TokenInfo | null> {
  try {
    const response = await fetch(`https://frontend-api-v2.pump.fun/coins/${mintAddress}`);

    if (!response.ok) return null;

    const data = await response.json();

    return {
      isPumpFun: true,
      name: data.name,
      symbol: data.symbol,
      image: data.image_uri,
      marketCap: data.usd_market_cap,
      creator: data.creator,
    };
  } catch (error) {
    console.error('[TokenInfo] Error fetching Pump.fun data:', error);
    return null;
  }
}

// Get token info from DexScreener
export async function getDexScreenerTokenInfo(mintAddress: string): Promise<any | null> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);

    if (!response.ok) return null;

    const data = await response.json();

    if (data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0];
      return {
        name: pair.baseToken?.name,
        symbol: pair.baseToken?.symbol,
        priceUsd: parseFloat(pair.priceUsd || '0'),
        volume24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
      };
    }

    return null;
  } catch (error) {
    console.error('[TokenInfo] Error fetching DexScreener data:', error);
    return null;
  }
}

// Get token links
export function getTokenLinks(mintAddress: string, isPumpFun: boolean) {
  return {
    pumpFun: isPumpFun ? `https://pump.fun/coin/${mintAddress}` : null,
    dexScreener: `https://dexscreener.com/solana/${mintAddress}`,
    birdeye: `https://birdeye.so/token/${mintAddress}?chain=solana`,
  };
}

// Get primary link (prioritize pump.fun > dexscreener)
export function getPrimaryLink(mintAddress: string, isPumpFun: boolean): string {
  if (isPumpFun) {
    return `https://pump.fun/coin/${mintAddress}`;
  }
  return `https://dexscreener.com/solana/${mintAddress}`;
}

// Batch check if tokens are from Pump.fun
export async function batchCheckPumpFun(mintAddresses: string[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  // Check in parallel with a limit
  const batchSize = 10;
  for (let i = 0; i < mintAddresses.length; i += batchSize) {
    const batch = mintAddresses.slice(i, i + batchSize);

    const promises = batch.map(async (mint) => {
      const isPump = await isPumpFunToken(mint);
      results.set(mint, isPump);
    });

    await Promise.all(promises);

    // Small delay to avoid rate limiting
    if (i + batchSize < mintAddresses.length) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  return results;
}
