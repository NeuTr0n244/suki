'use client';

import { motion } from 'framer-motion';
import { formatUsd, formatPercent, formatSol, formatNumber } from '@/lib/format';

interface FinancialCardProps {
  data: {
    totalSolSpent: number;
    totalSolReceived: number;
    totalInvestedUsd: number;
    totalReturnedUsd: number;
    totalPnlSol: number;
    totalPnlUsd: number;
    totalPnlPercent: number;
    winRate: number;
    totalTokensTraded: number;
    ruggedTokens: number;
    deadTokens: number;
    unknownTokens: number;
    activeTokens: number;
    diamondHandsCount: number;
    paperHandsCount: number;
    profitableTokens: number;
  };
}

export default function FinancialCard({ data }: FinancialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-purple-400">✦</span>
        <h3 className="text-lg font-bold text-slate-200 font-outfit">FINANCIAL OVERVIEW</h3>
      </div>
      <div className="border-t border-purple-500/20 mb-4" />
      <div className="space-y-3 font-mono text-sm">
        <div className="flex justify-between items-baseline">
          <span className="text-slate-400">💰 Total Spent</span>
          <div className="text-right">
            <div className="text-slate-200">{formatSol(data.totalSolSpent)}</div>
            <div className="text-slate-500 text-xs">(~${data.totalInvestedUsd.toFixed(2)})</div>
          </div>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-slate-400">📈 Total Received</span>
          <div className="text-right">
            <div className="text-slate-200">{formatSol(data.totalSolReceived)}</div>
            <div className="text-slate-500 text-xs">(~${data.totalReturnedUsd.toFixed(2)})</div>
          </div>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-slate-400">📊 Net PnL</span>
          <div className="text-right">
            <div className={data.totalPnlSol >= 0 ? 'text-green-400' : 'text-red-400'}>
              {data.totalPnlSol >= 0 ? '+' : ''}
              {formatSol(data.totalPnlSol)}
            </div>
            <div className={`text-xs ${data.totalPnlUsd >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
              (~{formatUsd(data.totalPnlUsd)}) {formatPercent(data.totalPnlPercent)}
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">🎯 Win Rate</span>
          <span className="text-slate-200">
            {data.winRate.toFixed(1)}% ({data.profitableTokens} of {data.totalTokensTraded})
          </span>
        </div>
        <div className="border-t border-purple-500/10 my-2" />
        <div className="flex justify-between">
          <span className="text-slate-400">📋 Tokens Traded</span>
          <span className="text-slate-200">{formatNumber(data.totalTokensTraded)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">☠️ Confirmed Rugs</span>
          <span className="text-red-400">
            {formatNumber(data.ruggedTokens)} ({((data.ruggedTokens / data.totalTokensTraded) * 100).toFixed(1)}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">⚰️ Dead Tokens</span>
          <span className="text-amber-400">
            {formatNumber(data.deadTokens)} ({((data.deadTokens / data.totalTokensTraded) * 100).toFixed(1)}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">❓ Unknown</span>
          <span className="text-slate-500">
            {formatNumber(data.unknownTokens)} ({((data.unknownTokens / data.totalTokensTraded) * 100).toFixed(1)}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">✅ Active</span>
          <span className="text-green-400">
            {formatNumber(data.activeTokens)} ({((data.activeTokens / data.totalTokensTraded) * 100).toFixed(1)}%)
          </span>
        </div>
        <div className="border-t border-purple-500/10 my-2" />
        <div className="flex justify-between">
          <span className="text-slate-400">💎 Diamond Hands</span>
          <span className="text-cyan-400">{formatNumber(data.diamondHandsCount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">🧻 Paper Hands</span>
          <span className="text-amber-400">{formatNumber(data.paperHandsCount)}</span>
        </div>
      </div>
    </motion.div>
  );
}
