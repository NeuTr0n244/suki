export function formatUsd(v: number): string {
  const abs = Math.abs(v);
  if (abs < 0.01) return '$0.00';
  if (abs < 1) return (v >= 0 ? '+$' : '-$') + abs.toFixed(4);
  if (abs < 1000) return (v >= 0 ? '+$' : '-$') + abs.toFixed(2);
  if (abs < 10000)
    return (
      (v >= 0 ? '+$' : '-$') +
      abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  if (abs < 1000000) return (v >= 0 ? '+$' : '-$') + (abs / 1000).toFixed(1) + 'K';
  return (v >= 0 ? '+$' : '-$') + (abs / 1000000).toFixed(2) + 'M';
}

export function formatPercent(v: number): string {
  if (!isFinite(v) || isNaN(v)) return '0%';
  if (Math.abs(v) > 99999) return (v > 0 ? '+' : '') + '>99,999%';
  const p = v >= 0 ? '+' : '';
  if (Math.abs(v) < 1) return p + v.toFixed(2) + '%';
  if (Math.abs(v) < 100) return p + v.toFixed(1) + '%';
  return p + Math.round(v).toLocaleString('en-US') + '%';
}

export function formatSol(v: number): string {
  if (Math.abs(v) < 0.001) return '0 SOL';
  if (Math.abs(v) < 1) return v.toFixed(4) + ' SOL';
  if (Math.abs(v) < 100) return v.toFixed(2) + ' SOL';
  return v.toFixed(1) + ' SOL';
}

export function formatNumber(v: number): string {
  return v.toLocaleString('en-US');
}

export function truncateWallet(w: string): string {
  return w.slice(0, 6) + '...' + w.slice(-4);
}
