import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { MOCK_CRYPTO_ASSETS, MOCK_STOCK_ASSETS, MOCK_TRANSACTIONS } from '../constants';
import type { Asset, Transaction } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const portfolioData = [
    { name: 'Jan', value: 10000 },
    { name: 'Feb', value: 12000 },
    { name: 'Mar', value: 11000 },
    { name: 'Apr', value: 15000 },
    { name: 'May', value: 18000 },
    { name: 'Jun', value: 17000 },
    { name: 'Jul', value: 20000 },
];

const Dashboard: React.FC = () => {
    const totalCryptoValue = MOCK_CRYPTO_ASSETS.reduce((acc, asset) => acc + asset.price * asset.holdings, 0);
    const totalStockValue = MOCK_STOCK_ASSETS.reduce((acc, asset) => acc + asset.price * asset.holdings, 0);
    const netWorth = totalCryptoValue + totalStockValue + 5000; // adding some cash
    const totalIncome = MOCK_TRANSACTIONS.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = MOCK_TRANSACTIONS.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const recentTransactions = [...MOCK_TRANSACTIONS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    const TransactionRow = ({ transaction }: { transaction: Transaction }) => (
        <div className="flex justify-between items-center py-3 border-b border-slate-800 last:border-b-0">
            <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${transaction.type === 'income' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {transaction.type === 'income' ? '↓' : '↑'}
                </div>
                <div>
                    <p className="font-medium text-slate-200">{transaction.description}</p>
                    <p className="text-sm text-slate-500">{transaction.date}</p>
                </div>
            </div>
            <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
            </p>
        </div>
    );

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Net Worth" value={formatCurrency(netWorth)} change={1.2} icon={<span>💼</span>} />
        <DashboardCard title="Portfolio Value" value={formatCurrency(totalCryptoValue + totalStockValue)} change={2.5} icon={<span>📈</span>} />
        <DashboardCard title="Monthly Income" value={formatCurrency(totalIncome)} icon={<span>💰</span>} />
        <DashboardCard title="Monthly Expenses" value={formatCurrency(totalExpenses)} icon={<span>💸</span>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Portfolio Chart */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Portfolio Trend</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <AreaChart data={portfolioData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} />
                        <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Recent Transactions</h2>
          <div className="space-y-2">
            {recentTransactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
