'use client';

import { motion } from 'framer-motion';
import { formatUsd, formatPercent, formatSol } from '@/lib/format';

interface TradesCardProps {
  topWins: any[];
  topLosses: any[];
}

export default function TradesCard({ topWins, topLosses }: TradesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-purple-400">✦</span>
        <h3 className="text-lg font-bold text-slate-200 font-outfit">TOP TRADES</h3>
      </div>
      <div className="border-t border-purple-500/20 mb-4" />
      <div className="grid md:grid-cols-2 gap-6">
        {/* Best Trades */}
        <div>
          <div className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2 font-outfit">
            <span>🟢</span> BEST TRADES
          </div>
          <div className="space-y-2">
            {topWins.length > 0 ? (
              topWins.map((token, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-200 font-mono text-sm truncate flex-1">
                      {token.symbol}
                    </span>
                    <span className="text-xs text-green-400 font-mono ml-2">
                      {formatPercent(token.pnlPercent)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <div className="text-green-400 font-mono">
                      <div>+{formatSol(token.pnlSol)}</div>
                      <div className="text-green-400/60 text-[10px]">(~{formatUsd(token.pnlUsd)})</div>
                    </div>
                    <span className="text-slate-500 font-mono">{token.trades} trades</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic">No profitable trades yet</div>
            )}
          </div>
        </div>

        {/* Worst Trades */}
        <div>
          <div className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2 font-outfit">
            <span>🔴</span> WORST TRADES
          </div>
          <div className="space-y-2">
            {topLosses.length > 0 ? (
              topLosses.map((token, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-all"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-200 font-mono text-sm truncate flex-1">
                      {token.status === 'rugged' && '☠️ '}
                      {token.status === 'dead' && '⚰️ '}
                      {token.symbol}
                    </span>
                    <span className="text-xs text-red-400 font-mono ml-2">
                      {formatPercent(token.pnlPercent)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <div className="text-red-400 font-mono">
                      <div>{formatSol(token.pnlSol)}</div>
                      <div className="text-red-400/60 text-[10px]">(~{formatUsd(token.pnlUsd)})</div>
                    </div>
                    <span className="text-slate-500 font-mono">{token.trades} trades</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic">No losing trades</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
