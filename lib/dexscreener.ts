export async function getTokensData(addresses: string[]) {
  const map = new Map();
  const chunks = [];
  for (let i = 0; i < addresses.length; i += 30) chunks.push(addresses.slice(i, i + 30));

  for (const chunk of chunks) {
    try {
      const res = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${chunk.join(',')}`);
      const pairs = await res.json();
      for (const pair of (Array.isArray(pairs) ? pairs : [])) {
        if (pair.baseToken && !map.has(pair.baseToken.address)) {
          map.set(pair.baseToken.address, {
            address: pair.baseToken.address,
            name: pair.baseToken.name,
            symbol: pair.baseToken.symbol,
            priceUsd: parseFloat(pair.priceUsd || '0'),
            liquidity: pair.liquidity?.usd || 0,
            marketCap: pair.marketCap || 0,
            pairCreatedAt: pair.pairCreatedAt || 0,
            volume24h: pair.volume?.h24 || 0,
          });
        }
      }
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }
  return map;
}

export async function getSolPrice(): Promise<number> {
  try {
    const res = await fetch('https://api.dexscreener.com/latest/dex/pairs/solana/So11111111111111111111111111111111111111112');
    const data = await res.json();
    return parseFloat(data.pairs?.[0]?.priceUsd || '150');
  } catch {
    return 150;
  }
}
