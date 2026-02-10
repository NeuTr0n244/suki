export function calculateDegenScore(m: any): number {
  let s = 0;

  // Trading frequency
  if (m.totalTradesCount > 500) s += 15;
  else if (m.totalTradesCount > 200) s += 12;
  else if (m.totalTradesCount > 50) s += 8;
  else if (m.totalTradesCount > 10) s += 4;

  // Token diversity
  if (m.totalTokensTraded > 200) s += 15;
  else if (m.totalTokensTraded > 100) s += 12;
  else if (m.totalTokensTraded > 30) s += 8;
  else if (m.totalTokensTraded > 10) s += 4;

  // Rug rate
  const rugRate = m.totalTokensTraded > 0 ? m.ruggedTokens / m.totalTokensTraded : 0;
  if (rugRate > 0.7) s += 15;
  else if (rugRate > 0.5) s += 12;
  else if (rugRate > 0.3) s += 8;
  else if (rugRate > 0.1) s += 4;

  // Paper hands rate
  const paperRate = m.totalTokensTraded > 0 ? m.paperHandsCount / m.totalTokensTraded : 0;
  if (paperRate > 0.5) s += 10;
  else if (paperRate > 0.3) s += 7;
  else if (paperRate > 0.1) s += 4;

  // Night trading
  if (m.nightTradesPct > 40) s += 10;
  else if (m.nightTradesPct > 25) s += 7;
  else if (m.nightTradesPct > 10) s += 4;

  // Average hold time
  if (m.avgHoldTimeMinutes < 10) s += 10;
  else if (m.avgHoldTimeMinutes < 60) s += 7;
  else if (m.avgHoldTimeMinutes < 360) s += 4;

  // Token age at buy
  if (m.avgTokenAgeAtBuyHours < 1) s += 10;
  else if (m.avgTokenAgeAtBuyHours < 6) s += 7;
  else if (m.avgTokenAgeAtBuyHours < 24) s += 4;

  // Active days
  if (m.activeDays > 60) s += 5;
  else if (m.activeDays > 30) s += 3;
  else if (m.activeDays > 7) s += 1;

  // Bonus points
  if (m.totalPnlPercent < -50 && m.winRate < 30) s += 5;
  if (m.ruggedTokens > 10) s += 5;
  if (m.diamondHandsCount > 10) s -= 5;

  return Math.max(0, Math.min(s, 100));
}

export function getDegenTitle(score: number) {
  if (score >= 90) return { title: "Legendary Degen", emoji: "🏆", desc: "You ARE the rug pull" };
  if (score >= 80) return { title: "Terminal Degen", emoji: "💀", desc: "Your wallet needs therapy" };
  if (score >= 70) return { title: "Hardcore Degen", emoji: "🔥", desc: "Sleep is for the weak" };
  if (score >= 60) return { title: "Active Degen", emoji: "🎰", desc: "Casino with extra steps" };
  if (score >= 50) return { title: "Semi-Degen", emoji: "🎲", desc: "One foot in the abyss" };
  if (score >= 40) return { title: "Casual Degen", emoji: "⚡", desc: "Pretends to DYOR first" };
  if (score >= 30) return { title: "Curious Normie", emoji: "📊", desc: "Still reads whitepapers" };
  if (score >= 20) return { title: "Cautious", emoji: "🐢", desc: "Probably DCA-ing into BTC" };
  if (score >= 10) return { title: "Conservative", emoji: "🏦", desc: "Your mom would approve" };
  return { title: "NPC", emoji: "👼", desc: "Do you even crypto?" };
}
