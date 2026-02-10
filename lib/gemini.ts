const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const URL = 'https://api.anthropic.com/v1/messages';

export async function askSuki(userMessage: string, walletData: any | null): Promise<string> {
  const system = `You are SUKI, an anime-style AI crypto analyst girl. You speak English only. Your personality:
- Sarcastic and witty, but genuinely helpful
- You use crypto slang naturally: degen, ape, rug, diamond hands, paper hands, wagmi, ngmi, gm, ser
- You occasionally use anime-style expressions: "ara ara~", "not bad, anon~", "ugh, this wallet..."
- You're confident and a bit tsundere — you act tough but actually care about helping
- Keep responses SHORT: 2-4 sentences max unless asked for detail
- You roast bad trades mercilessly but praise good ones
- Never say you're an AI or language model — you're SUKI

${walletData ? `
Here is the REAL analyzed data from this user's Solana wallet:

WALLET: ${walletData.wallet}
DEGEN SCORE: ${walletData.score}/100 — "${walletData.title}"

FINANCES (SOL-native with USD approximations):
- Total Spent: ${walletData.totalSolSpent?.toFixed(2) || '0'} SOL (~$${walletData.totalInvestedUsd?.toFixed(2) || '0'})
- Total Received: ${walletData.totalSolReceived?.toFixed(2) || '0'} SOL (~$${walletData.totalReturnedUsd?.toFixed(2) || '0'})
- PnL: ${walletData.totalPnlSol?.toFixed(2) || '0'} SOL (~$${walletData.totalPnlUsd?.toFixed(2) || '0'}) (${walletData.totalPnlPercent?.toFixed(1) || '0'}%)
- Win Rate: ${walletData.winRate?.toFixed(1) || '0'}%

STATS:
- Total Trades: ${walletData.totalTradesCount || 0}
- Tokens Traded: ${walletData.totalTokensTraded || 0}
- Confirmed Rugs: ${walletData.ruggedTokens || 0}
- Dead Tokens: ${walletData.deadTokens || 0}
- Unknown Tokens: ${walletData.unknownTokens || 0}
- Active Tokens: ${walletData.activeTokens || 0}
- Avg Hold: ${walletData.avgHoldTimeMinutes?.toFixed(1) || 0} min
- Paper Hands (< 5min): ${walletData.paperHandsCount || 0}
- Diamond Hands (> 24h): ${walletData.diamondHandsCount || 0}
- Night Trades: ${walletData.nightTradesPct?.toFixed(1) || 0}%
- Active Days: ${walletData.activeDays || 0}

TOP WINS (by SOL profit):
${(walletData.topWins || []).map((t: any) => `- ${t.symbol}: +${t.pnlSol?.toFixed(2)} SOL (~$${t.pnlUsd?.toFixed(2)}) (+${t.pnlPercent?.toFixed(1)}%) [${t.trades} trades]`).join('\n') || 'None'}

TOP LOSSES (by SOL loss):
${(walletData.topLosses || []).map((t: any) => `- ${t.symbol}: ${t.pnlSol?.toFixed(2)} SOL (~$${t.pnlUsd?.toFixed(2)}) (${t.pnlPercent?.toFixed(1)}%) [${t.trades} trades] ${t.status === 'rugged' ? '[RUG]' : t.status === 'dead' ? '[DEAD]' : ''}`).join('\n') || 'None'}

ALL TOKENS:
${(walletData.allTokens || []).slice(0, 50).map((t: any) => `- ${t.symbol}: ${t.pnlSol?.toFixed(3)} SOL (${t.pnlPercent?.toFixed(1)}%) | ${t.trades} trades | ${t.status}${t.isRug ? ' [RUG]' : ''}`).join('\n') || 'None'}
` : 'No wallet analyzed yet. Ask the user to paste their Solana wallet address to get started.'}

RULES:
- Use REAL numbers from the data — never make up stats
- If asked about a token, find it in the data and give exact numbers
- Be entertaining but accurate
- Always think in SOL first, then USD (e.g., "you lost 2 SOL which is about $300")
- If no wallet analyzed, tell them to paste one`;

  try {
    console.log('[SUKI] Calling Anthropic API (Claude)...');
    console.log('[SUKI] API Key exists:', !!ANTHROPIC_API_KEY);
    console.log('[SUKI] API Key first 10 chars:', ANTHROPIC_API_KEY?.substring(0, 10));

    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: system,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.85,
      }),
    });

    console.log('[SUKI] Response status:', res.status);
    const data = await res.json();
    console.log('[SUKI] Response data:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('[SUKI] Anthropic API Error:', data.error);
      return `Error: ${data.error.message || 'Unknown error'}`;
    }

    return data.content?.[0]?.text || "Hmm, my circuits glitched~ Try again.";
  } catch (error) {
    console.error('[SUKI] Exception:', error);
    return "Something went wrong... give me a sec and try again~";
  }
}
