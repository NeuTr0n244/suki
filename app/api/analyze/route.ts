import { NextRequest, NextResponse } from 'next/server';
import { analyzeWallet, transformToAppFormat, getSolPriceUSD } from '@/lib/wallet-analysis';
import { calculateDegenScore, getDegenTitle } from '@/lib/score';

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 });

  try {
    console.log(`[Analyze] Starting analysis for ${wallet.slice(0, 4)}...${wallet.slice(-4)}`);

    // Use new precise wallet analysis
    const analysis = await analyzeWallet(wallet);

    if (!analysis || analysis.totalTokens === 0) {
      return NextResponse.json({ error: 'No trades found for this wallet' }, { status: 404 });
    }

    // Get SOL price for USD conversions
    const solPrice = await getSolPriceUSD();

    // Transform to app format
    const metrics = transformToAppFormat(analysis, solPrice);
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
