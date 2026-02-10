import { NextRequest, NextResponse } from 'next/server';
import { getWalletSwaps } from '@/lib/helius';
import { getTokensData, getSolPrice } from '@/lib/dexscreener';
import { calculateMetrics } from '@/lib/metrics';
import { calculateDegenScore, getDegenTitle } from '@/lib/score';

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 });

  try {
    const swapData = await getWalletSwaps(wallet);
    if (!swapData.swaps.length) return NextResponse.json({ error: 'No trades found' }, { status: 404 });

    const tokenAddresses = [
      ...new Set(
        swapData.swaps
          .flatMap((s: any) => (s.tokenTransfers || []).map((t: any) => t.mint))
          .filter((m: string) => m && m !== 'So11111111111111111111111111111111111111112')
      ),
    ];

    const [tokenData, solPrice] = await Promise.all([
      getTokensData(tokenAddresses as string[]),
      getSolPrice(),
    ]);

    const metrics = calculateMetrics(swapData.swaps, tokenData, solPrice, wallet, swapData.tokenMeta);
    const score = calculateDegenScore(metrics);
    const { title, emoji, desc } = getDegenTitle(score);

    return NextResponse.json({
      wallet,
      score,
      title,
      emoji,
      desc,
      ...metrics,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
