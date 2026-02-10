const KEY = process.env.HELIUS_API_KEY;

interface ParsedTransaction {
  signature: string;
  timestamp: number;
  tokenTransfers: any[];
  nativeTransfers: any[];
  source: string;
  type: string;
  feePayer: string;
}

export async function getWalletSwaps(wallet: string) {
  const all: ParsedTransaction[] = [];
  let before: string | undefined;

  console.log(`[Helius] Fetching transactions for wallet ${wallet.slice(0, 4)}...${wallet.slice(-4)}`);

  // First, get all transaction signatures using Solana RPC
  let allSignatures: string[] = [];

  while (allSignatures.length < 1000) {
    const rpcBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [
        wallet,
        {
          limit: 100,
          ...(before ? { before } : {}),
        },
      ],
    };

    const sigResponse = await fetch(`https://rpc.helius.xyz/?api-key=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcBody),
    });

    if (!sigResponse.ok) break;
    const sigData = await sigResponse.json();
    const sigs = sigData.result || [];

    if (sigs.length === 0) break;

    allSignatures.push(...sigs.map((s: any) => s.signature));
    before = sigs[sigs.length - 1].signature;

    console.log(`[Helius] Fetched ${allSignatures.length} signatures...`);

    if (sigs.length < 100) break;
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`[Helius] Total signatures: ${allSignatures.length}`);

  // Now fetch parsed transaction details for each signature
  // Process in batches of 50
  for (let i = 0; i < allSignatures.length && i < 500; i += 50) {
    const batch = allSignatures.slice(i, i + 50);

    try {
      const response = await fetch(
        `https://api.helius.xyz/v0/transactions/?api-key=${KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: batch }),
        }
      );

      if (!response.ok) {
        console.error(`[Helius] Batch ${i / 50 + 1} failed:`, response.status);
        continue;
      }

      const txData = await response.json();

      // Filter to only transactions with token transfers (swaps)
      const swaps = txData.filter((tx: any) =>
        tx.tokenTransfers &&
        tx.tokenTransfers.length > 0 &&
        tx.nativeTransfers &&
        tx.nativeTransfers.length > 0
      );

      // DEBUG: Log first transaction structure
      if (all.length === 0 && swaps.length > 0) {
        console.log('[Helius] ===== SAMPLE TRANSACTION =====');
        console.log('[Helius] Signature:', swaps[0].signature);
        console.log('[Helius] Token Transfers:', JSON.stringify(swaps[0].tokenTransfers?.slice(0, 2), null, 2));
        console.log('[Helius] Native Transfers:', JSON.stringify(swaps[0].nativeTransfers?.slice(0, 2), null, 2));
        console.log('[Helius] ==============================');
      }

      all.push(...swaps);
      console.log(`[Helius] Batch ${i / 50 + 1}: ${swaps.length} swaps found`);

      await new Promise(r => setTimeout(r, 200));
    } catch (error) {
      console.error(`[Helius] Error fetching batch:`, error);
    }
  }

  // Extract token metadata
  const tokenMeta = new Map<string, { name: string; symbol: string }>();

  for (const tx of all) {
    for (const transfer of (tx.tokenTransfers || [])) {
      if (transfer.mint && !tokenMeta.has(transfer.mint)) {
        const name = transfer.tokenName || transfer.tokenSymbol || '';
        const symbol = transfer.tokenSymbol || (name ? name.slice(0, 6) : '');

        if (name || symbol) {
          tokenMeta.set(transfer.mint, { name, symbol });
        }
      }
    }
  }

  console.log(`[Helius] Found ${all.length} total swap transactions`);

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
