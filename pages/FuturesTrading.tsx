import React, { useState, useMemo, useEffect } from 'react';
import type { FuturesTrade } from '../types';
import { formatCurrency, exportToCsv } from '../utils/helpers';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Omit<FuturesTrade, 'id' | 'pnl'>, id?: string) => Promise<void>;
  trade: FuturesTrade | null;
}

const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, onSave, trade }) => {
    const [formData, setFormData] = useState<Omit<FuturesTrade, 'id' | 'pnl'>>({
        date: new Date().toISOString().split('T')[0],
        pair: '',
        type: 'LONG',
        entryPrice: 0,
        exitPrice: 0,
        size: 0,
        status: 'OPEN',
    });

    useEffect(() => {
        if (trade) {
            setFormData({
                date: trade.date,
                pair: trade.pair,
                type: trade.type,
                entryPrice: trade.entryPrice,
                exitPrice: trade.exitPrice,
                size: trade.size,
                status: trade.status,
            });
        } else {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                pair: '',
                type: 'LONG',
                entryPrice: 0,
                exitPrice: 0,
                size: 0,
                status: 'OPEN',
            });
        }
    }, [trade, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumber = ['entryPrice', 'exitPrice', 'size'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData, trade?.id);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-6">{trade ? 'Edit' : 'Log New'} Trade</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="pair" value={formData.pair} onChange={handleChange} placeholder="Pair (e.g., BTC/USD)" required className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700" />
                        <input name="date" value={formData.date} onChange={handleChange} type="date" required className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700">
                            <option value="LONG">Long</option>
                            <option value="SHORT">Short</option>
                        </select>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700">
                            <option value="OPEN">Open</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="entryPrice" value={formData.entryPrice} onChange={handleChange} type="number" step="any" placeholder="Entry Price" required className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700" />
                         <input name="size" value={formData.size} onChange={handleChange} type="number" step="any" placeholder="Size" required className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700" />
                    </div>
                     <input name="exitPrice" value={formData.exitPrice} onChange={handleChange} type="number" step="any" placeholder="Exit Price (if closed)" className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700" disabled={formData.status === 'OPEN'} />

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-cyan-500 text-white font-semibold">Save Trade</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const FuturesTrading: React.FC = () => {
    const [trades, setTrades] = useState<FuturesTrade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrade, setEditingTrade] = useState<FuturesTrade | null>(null);

     const fetchTrades = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/futures-trades');
            if (!res.ok) throw new Error('Failed to fetch trades');
            const data: FuturesTrade[] = await res.json();
            setTrades(data);
        } catch (err) {
             if (err instanceof Error) setError(err.message);
             else setError('An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, []);

    const stats = useMemo(() => {
        const closedTrades = trades.filter(t => t.status === 'CLOSED');
        const totalPnl = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
        const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
        const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;
        return { totalPnl, winRate, totalTrades: closedTrades.length };
    }, [trades]);
    
    const handleExport = () => {
        exportToCsv('futures_trades.csv', trades);
    };

    const handleSaveTrade = async (tradeData: Omit<FuturesTrade, 'id' | 'pnl'>, id?: string) => {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/futures-trades/${id}` : '/api/futures-trades';
        
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tradeData),
            });
            if (!response.ok) throw new Error('Failed to save trade');
            await fetchTrades();
        } catch (err) {
            console.error(err);
        }
    };
    
    const handleDeleteTrade = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this trade log?")) {
            try {
                const response = await fetch(`/api/futures-trades/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete trade');
                await fetchTrades();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleLogNewTrade = () => {
        setEditingTrade(null);
        setIsModalOpen(true);
    };

    const handleEditTrade = (trade: FuturesTrade) => {
        setEditingTrade(trade);
        setIsModalOpen(true);
    };


    return (
        <div className="space-y-8">
            <TradeModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTrade}
                trade={editingTrade}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400">Total PnL</p>
                    <p className={`text-2xl font-bold ${stats.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{loading ? '...' : formatCurrency(stats.totalPnl)}</p>
                </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400">Win Rate</p>
                    <p className="text-2xl font-bold text-cyan-400">{loading ? '...' : `${stats.winRate.toFixed(2)}%`}</p>
                </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400">Total Closed Trades</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{loading ? '...' : stats.totalTrades}</p>
                </div>
            </div>

            {/* Trade Log */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Trade Log</h2>
                     <div className="flex items-center space-x-2">
                        <button onClick={handleExport} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                            Export CSV
                        </button>
                        <button onClick={handleLogNewTrade} className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors">
                            Log New Trade
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {loading && <p>Loading trades...</p>}
                    {error && <p className="text-red-500">Error: {error}</p>}
                    {!loading && !error && (
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Pair</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Entry Price</th>
                                    <th className="p-4">Exit Price</th>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">PnL</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trades.map(trade => (
                                    <tr key={trade.id} className="border-b border-gray-200 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="p-4 text-slate-500 dark:text-slate-400">{trade.date}</td>
                                        <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{trade.pair}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${trade.type === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {trade.type}
                                            </span>
                                        </td>
                                        <td className="p-4">{formatCurrency(trade.entryPrice, trade.entryPrice < 100 ? 4 : 2)}</td>
                                        <td className="p-4">{trade.status === 'CLOSED' ? formatCurrency(trade.exitPrice, trade.exitPrice < 100 ? 4 : 2) : '-'}</td>
                                        <td className="p-4">{trade.size}</td>
                                        <td className="p-4">
                                            <span className={`font-medium ${trade.status === 'OPEN' ? 'text-yellow-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {trade.status}
                                            </span>
                                        </td>
                                        <td className={`p-4 text-right font-semibold ${trade.pnl > 0 ? 'text-green-500' : trade.pnl < 0 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {trade.status === 'CLOSED' ? formatCurrency(trade.pnl) : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => handleEditTrade(trade)} className="text-slate-500 hover:text-cyan-500 p-1">✏️</button>
                                            <button onClick={() => handleDeleteTrade(trade.id)} className="text-slate-500 hover:text-red-500 p-1">🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FuturesTrading;