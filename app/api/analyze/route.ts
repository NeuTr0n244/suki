import { NextRequest, NextResponse } from 'next/server';
import { getWalletPnL, transformToOurFormat } from '@/lib/solana-tracker';
import { getSolPrice } from '@/lib/dexscreener';
import { calculateDegenScore, getDegenTitle } from '@/lib/score';

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 });

  try {
    // Get SOL price first
    const solPrice = await getSolPrice();

    // Try Solana Tracker API (recommended - returns PnL already calculated)
    const pnlData = await getWalletPnL(wallet);

    if (!pnlData) {
      return NextResponse.json(
        { error: 'Could not fetch wallet data. Please check the wallet address and try again.' },
        { status: 404 }
      );
    }

    // Check if wallet has any trading activity
    if (Object.keys(pnlData.tokens).length === 0) {
      return NextResponse.json(
        { error: 'No trades found for this wallet' },
        { status: 404 }
      );
    }

    // Transform to our format
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
  } catch (e: any) {
    console.error('[Analyze] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
