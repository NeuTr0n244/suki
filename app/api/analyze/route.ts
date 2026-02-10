import { NextRequest, NextResponse } from 'next/server';
import { getWalletPnL, transformToOurFormat } from '@/lib/solana-tracker';
import { getWalletSwaps } from '@/lib/helius';
import { getTokensData, getSolPrice } from '@/lib/dexscreener';
import { calculateMetrics } from '@/lib/metrics';
import { calculateDegenScore, getDegenTitle } from '@/lib/score';

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 });

  try {
    // Get SOL price first
    const solPrice = await getSolPrice();

    // Try Solana Tracker API first (recommended - returns PnL already calculated)
    const pnlData = await getWalletPnL(wallet);

    if (pnlData && Object.keys(pnlData.tokens).length > 0) {
      // Solana Tracker worked! Use its data
      console.log('[Analyze] Using Solana Tracker data');
      const metrics = transformToOurFormat(pnlData, solPrice);
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
    }

    // Fallback to Helius if Solana Tracker fails
    console.log('[Analyze] Solana Tracker unavailable, falling back to Helius');
    const swapData = await getWalletSwaps(wallet);

    if (!swapData.swaps.length) {
      return NextResponse.json({ error: 'No trades found' }, { status: 404 });
    }

    const tokenAddresses = [
      ...new Set(
        swapData.swaps
          .flatMap((s: any) => (s.tokenTransfers || []).map((t: any) => t.mint))
          .filter((m: string) => m && m !== 'So11111111111111111111111111111111111111112')
      ),
    ];

    const tokenData = await getTokensData(tokenAddresses as string[]);
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
    console.error('[Analyze] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
