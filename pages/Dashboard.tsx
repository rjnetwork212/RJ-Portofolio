import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import type { Transaction, Budget, Goal } from '../types';
import { formatCurrency } from '../utils/helpers';
import { supabase } from '../lib/supabaseClient';

// NOTE: Portfolio, budget, and goal data are still mocked for simplicity.
const portfolioData = [
    { name: 'Jan', value: 10000 },
    { name: 'Feb', value: 12000 },
    { name: 'Mar', value: 11000 },
    { name: 'Apr', value: 15000 },
    { name: 'May', value: 18000 },
    { name: 'Jun', value: 17000 },
    { name: 'Jul', value: 20000 },
];
const MOCK_BUDGETS: Budget[] = [
    { id: 'b1', category: 'Food', allocated: 500, spent: 236.25 },
    { id: 'b2', category: 'Transport', allocated: 150, spent: 55.20 },
];
const MOCK_GOALS: Goal[] = [
    { id: 'g1', name: 'Emergency Fund', target: 10000, saved: 7500, emoji: '🛡️' },
    { id: 'g2', name: 'Vacation to Japan', target: 5000, saved: 1200, emoji: '✈️' },
];

const supabaseToTransaction = (item: any): Transaction => ({
  id: item.id,
  date: item.date,
  description: item.description,
  amount: item.amount,
  category: item.category,
  subCategory: item.sub_category,
  type: item.type,
});

const TransactionRow = ({ transaction }: { transaction: Transaction }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-slate-800 last:border-b-0">
        <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${transaction.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {transaction.type === 'income' ? '↓' : '↑'}
            </div>
            <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">{transaction.description}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">{transaction.date}</p>
            </div>
        </div>
        <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
            {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
        </p>
    </div>
);

const Budgets: React.FC = () => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Budgets</h2>
        <div className="space-y-4">
            {MOCK_BUDGETS.map(budget => {
                const progress = (budget.spent / budget.allocated) * 100;
                return (
                    <div key={budget.id}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{budget.category}</span>
                            <span className="text-sm text-slate-500">{formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const FinancialGoals: React.FC = () => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Financial Goals</h2>
        <div className="space-y-4">
            {MOCK_GOALS.map(goal => {
                const progress = (goal.saved / goal.target) * 100;
                return (
                    <div key={goal.id} className="flex items-center">
                        <div className="text-2xl mr-4">{goal.emoji}</div>
                        <div className="w-full">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{goal.name}</span>
                                <span className="text-sm text-green-500 font-semibold">{progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);


const Dashboard: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*');

                if (error) throw error;
                setTransactions(data.map(supabaseToTransaction));
            } catch (err) {
                 if (err instanceof Error) setError(err.message);
                 else setError('An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netIncome = totalIncome - totalExpenses;
    const businessRevenue = transactions.filter(t => t.type === 'income' && t.category === 'Business').reduce((sum, t) => sum + t.amount, 0);
    
    // NOTE: Net worth is simplified. In a real app, you'd fetch portfolio values too.
    const netWorth = 20000 + netIncome; // Example starting portfolio value + net income
    const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    
  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Net Worth" value={formatCurrency(netWorth)} change={1.2} icon={<span>💼</span>} />
        <DashboardCard title="Net Income" value={loading ? '...' : formatCurrency(netIncome)} change={-0.5} icon={<span>💰</span>} />
        <DashboardCard title="Business Revenue" value={loading ? '...' : formatCurrency(businessRevenue)} change={5.2} icon={<span>📊</span>} />
        <DashboardCard title="Total Expenses" value={loading ? '...' : formatCurrency(totalExpenses)} icon={<span>💸</span>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Portfolio Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Portfolio Trend</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <AreaChart data={portfolioData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                        <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-slate-500" />
                        <YAxis stroke="#6b7280" className="dark:stroke-slate-500" tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                        <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Recent Transactions</h2>
          {loading && <p>Loading transactions...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && (
            <div className="space-y-2">
              {recentTransactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
            </div>
          )}
        </div>
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Budgets />
        <FinancialGoals />
      </div>
    </div>
  );
};

export default Dashboard;