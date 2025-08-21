import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MOCK_TRANSACTIONS } from '../constants';
import type { Transaction } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const COLORS = ['#0ea5e9', '#84cc16', '#ef4444', '#f97316', '#8b5cf6'];

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

    const expenseData = useMemo(() => {
        const categories = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transactions List */}
            <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-100">All Transactions</h2>
                    <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors">
                        Add Transaction
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-700 text-sm text-slate-400">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Category</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50">
                                    <td className="p-4 text-slate-400">{tx.date}</td>
                                    <td className="p-4 font-medium text-slate-200">{tx.description}</td>
                                    <td className="p-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-700 text-slate-300">{tx.category}</span></td>
                                    <td className={`p-4 text-right font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatCurrency(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expense Chart */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h2 className="text-xl font-bold text-slate-100 mb-4">Expense Categories</h2>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={expenseData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {expenseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                    {expenseData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="text-slate-400">{entry.name}</span>
                            </div>
                            <span className="font-semibold text-slate-200">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Transactions;
