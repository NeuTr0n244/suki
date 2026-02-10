const KEY = process.env.HELIUS_API_KEY;

export async function getWalletSwaps(wallet: string) {
  let all: any[] = [];
  let lastSig: string | undefined;

  while (all.length < 1500) {
    const url = new URL(`https://api.helius.xyz/v0/addresses/${wallet}/transactions`);
    url.searchParams.set('api-key', KEY!);
    url.searchParams.set('type', 'SWAP');
    if (lastSig) url.searchParams.set('before', lastSig);

    const res = await fetch(url.toString());
    if (!res.ok) break;
    const data = await res.json();
    if (!data.length) break;

    all.push(...data);
    lastSig = data[data.length - 1].signature;
    await new Promise(r => setTimeout(r, 200));
  }

  // Extract token metadata from transactions
  const tokenMeta = new Map<string, { name: string; symbol: string }>();

  for (const tx of all) {
    for (const transfer of (tx.tokenTransfers || [])) {
      if (transfer.mint && !tokenMeta.has(transfer.mint)) {
        // Try to get name and symbol from the transfer
        const name = transfer.tokenName || transfer.tokenSymbol || '';
        const symbol = transfer.tokenSymbol || (name ? name.slice(0, 6) : '');

        if (name || symbol) {
          tokenMeta.set(transfer.mint, { name, symbol });
        }
      }
    }
  }

  return {
    swaps: all.map((tx: any) => ({
      signature: tx.signature,
      timestamp: tx.timestamp * 1000,
      tokenTransfers: tx.tokenTransfers || [],
      nativeTransfers: tx.nativeTransfers || [],
      source: tx.source || 'unknown',
      type: tx.type,
      feePayer: tx.feePayer,
    })),
    tokenMeta,
  };
}
