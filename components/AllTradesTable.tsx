'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatUsd, formatPercent, formatSol } from '@/lib/format';

interface AllTradesTableProps {
  allTokens: any[];
}

export default function AllTradesTable({ allTokens }: AllTradesTableProps) {
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<'pnl' | 'trades' | 'symbol'>('pnl');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...allTokens].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'pnl') comparison = b.pnlSol - a.pnlSol;
    else if (sortBy === 'trades') comparison = b.trades - a.trades;
    else comparison = a.symbol.localeCompare(b.symbol);
    return sortDir === 'desc' ? comparison : -comparison;
  });

  const displayed = expanded ? sorted : sorted.slice(0, 10);

  const toggleSort = (field: 'pnl' | 'trades' | 'symbol') => {
    if (sortBy === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const getStatusBadge = (status: string, isRug: boolean) => {
    if (isRug || status === 'rugged')
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">☠️ RUG</span>
      );
    if (status === 'dead')
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">⚰️ DEAD</span>
      );
    if (status === 'active')
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">✅ ACTIVE</span>
      );
    if (status === 'holding')
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">💎 HOLD</span>
      );
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-400">? UNK</span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-purple-400">✦</span>
          <h3 className="text-lg font-bold text-slate-200 font-outfit">ALL POSITIONS</h3>
          <span className="text-xs text-slate-500 font-mono">({allTokens.length} tokens)</span>
        </div>
      </div>
      <div className="border-t border-purple-500/20 mb-4" />
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-purple-500/20 text-slate-400">
              <th
                className="text-left py-2 cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => toggleSort('symbol')}
              >
                Token {sortBy === 'symbol' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th
                className="text-right py-2 cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => toggleSort('trades')}
              >
                Trades {sortBy === 'trades' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th className="text-right py-2">Spent (SOL)</th>
              <th className="text-right py-2">Received (SOL)</th>
              <th
                className="text-right py-2 cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => toggleSort('pnl')}
              >
                PnL (SOL) {sortBy === 'pnl' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th className="text-right py-2">PnL %</th>
              <th className="text-right py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((token, i) => (
              <tr
                key={i}
                className="border-b border-purple-500/10 hover:bg-white/5 transition-colors"
                title={`${token.name} (${token.address})`}
              >
                <td className="py-3 text-slate-200 max-w-[120px] truncate">
                  {token.symbol}
                </td>
                <td className="text-right text-slate-400">{token.trades}</td>
                <td className="text-right text-slate-400">{token.totalSolSpent.toFixed(3)}</td>
                <td className="text-right text-slate-400">{token.totalSolReceived.toFixed(3)}</td>
                <td
                  className={`text-right font-bold ${token.pnlSol >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  title={`~${formatUsd(token.pnlUsd)}`}
                >
                  {token.pnlSol >= 0 ? '+' : ''}
                  {token.pnlSol.toFixed(3)}
                </td>
                <td
                  className={`text-right ${token.pnlPercent >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}
                >
                  {formatPercent(token.pnlPercent)}
                </td>
                <td className="text-right">{getStatusBadge(token.status, token.isRug)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {allTokens.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full py-2 px-4 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all text-purple-400 font-outfit flex items-center justify-center gap-2"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show all {allTokens.length} tokens <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}
