import { NextRequest, NextResponse } from 'next/server';
import { analyzeWalletNew } from '@/lib/wallet-analyzer';
import { calculateDegenScore, getDegenTitle } from '@/lib/score';

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 });

  try {
    console.log(`[Analyze] Starting NEW analysis for ${wallet.slice(0, 4)}...${wallet.slice(-4)}`);

    // Use new rewritten analyzer
    const metrics = await analyzeWalletNew(wallet);

    if (!metrics || metrics.totalTokensTraded === 0) {
      return NextResponse.json({ error: 'No trades found for this wallet' }, { status: 404 });
    }

    const score = calculateDegenScore(metrics);
    const { title, emoji, desc } = getDegenTitle(score);

    console.log(`[Analyze] Analysis complete - PnL: $${metrics.totalPnlUsd.toFixed(2)}`);

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
    return NextResponse.json({ error: e.message || 'Analysis failed' }, { status: 500 });
  }
}
