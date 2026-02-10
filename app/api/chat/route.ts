import { NextRequest, NextResponse } from 'next/server';
import { askSuki } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  const { message, walletData } = await req.json();
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });
  const response = await askSuki(message, walletData);
  return NextResponse.json({ response });
}
