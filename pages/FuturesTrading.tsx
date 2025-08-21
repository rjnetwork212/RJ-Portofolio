import React, { useState, useMemo } from 'react';
import { MOCK_FUTURES_TRADES } from '../constants';
import type { FuturesTrade } from '../types';

const formatCurrency = (value: number, minimumFractionDigits = 2) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits }).format(value);

const FuturesTrading: React.FC = () => {
    const [trades, setTrades] = useState<FuturesTrade[]>(MOCK_FUTURES_TRADES);

    const stats = useMemo(() => {
        const closedTrades = trades.filter(t => t.status === 'CLOSED');
        const totalPnl = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
        const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
        const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;
        return { totalPnl, winRate, totalTrades: closedTrades.length };
    }, [trades]);

    return (
        <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <p className="text-slate-400">Total PnL</p>
                    <p className={`text-2xl font-bold ${stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(stats.totalPnl)}</p>
                </div>
                 <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <p className="text-slate-400">Win Rate</p>
                    <p className="text-2xl font-bold text-cyan-400">{stats.winRate.toFixed(2)}%</p>
                </div>
                 <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <p className="text-slate-400">Total Closed Trades</p>
                    <p className="text-2xl font-bold text-slate-200">{stats.totalTrades}</p>
                </div>
            </div>

            {/* Trade Log */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-100">Trade Log</h2>
                    <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors">
                        Log New Trade
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-700 text-sm text-slate-400">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Pair</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Entry Price</th>
                                <th className="p-4">Exit Price</th>
                                <th className="p-4">Size</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">PnL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades.map(trade => (
                                <tr key={trade.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50">
                                    <td className="p-4 text-slate-400">{trade.date}</td>
                                    <td className="p-4 font-medium text-slate-200">{trade.pair}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${trade.type === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {trade.type}
                                        </span>
                                    </td>
                                    <td className="p-4">{formatCurrency(trade.entryPrice, 4)}</td>
                                    <td className="p-4">{trade.status === 'CLOSED' ? formatCurrency(trade.exitPrice, 4) : '-'}</td>
                                    <td className="p-4">{trade.size}</td>
                                    <td className="p-4">
                                        <span className={`font-medium ${trade.status === 'OPEN' ? 'text-yellow-400' : 'text-slate-400'}`}>
                                            {trade.status}
                                        </span>
                                    </td>
                                    <td className={`p-4 text-right font-semibold ${trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                        {trade.status === 'CLOSED' ? formatCurrency(trade.pnl) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FuturesTrading;