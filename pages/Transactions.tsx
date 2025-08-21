import React, { useState, useMemo, useContext, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { Transaction } from '../types';
import { CategoryContext } from '../contexts/CategoryContext';
import { formatCurrency, exportToCsv } from '../utils/helpers';
import { supabase } from '../lib/supabaseClient';

const COLORS = ['#0ea5e9', '#84cc16', '#ef4444', '#f97316', '#8b5cf6', '#334155'];

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>, id?: string) => Promise<void>;
  transaction: Transaction | null;
}

const supabaseToTransaction = (item: any): Transaction => ({
  id: item.id,
  date: item.date,
  description: item.description,
  amount: item.amount,
  category: item.category,
  subCategory: item.sub_category,
  type: item.type,
});

const transactionToSupabase = (transaction: Omit<Transaction, 'id'>) => ({
  date: transaction.date,
  description: transaction.description,
  amount: transaction.amount,
  category: transaction.category,
  sub_category: transaction.subCategory,
  type: transaction.type,
});

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transaction }) => {
    const { categories } = useContext(CategoryContext);
    const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category: categories[0]?.name || '',
        subCategory: '',
        type: 'expense',
    });
    
    const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);

    useEffect(() => {
        const selectedCategory = categories.find(c => c.name === formData.category);
        if (selectedCategory) {
            setAvailableSubCategories(selectedCategory.subCategories.map(sc => sc.name));
        } else {
            setAvailableSubCategories([]);
        }
    }, [formData.category, categories]);


    useEffect(() => {
        if (transaction) {
            setFormData({
                date: transaction.date,
                description: transaction.description,
                amount: transaction.amount,
                category: transaction.category,
                subCategory: transaction.subCategory || '',
                type: transaction.type,
            });
        } else {
             setFormData({
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: 0,
                category: categories[0]?.name || '',
                subCategory: '',
                type: 'expense',
            });
        }
    }, [transaction, isOpen, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'category') {
             setFormData(prev => ({ ...prev, category: value, subCategory: '' })); // Reset subcategory on category change
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalAmount = formData.type === 'expense' && formData.amount > 0 ? -formData.amount : formData.amount;
        
        await onSave({ ...formData, amount: finalAmount }, transaction?.id);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-6">{transaction ? 'Edit' : 'Add'} Transaction</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700" />
                    <input name="amount" value={formData.amount < 0 ? formData.amount * -1 : formData.amount} onChange={handleChange} type="number" step="0.01" placeholder="Amount" required className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700" />
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700">
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                    <input name="date" value={formData.date} onChange={handleChange} type="date" required className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700" />
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700">
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <select name="subCategory" value={formData.subCategory} onChange={handleChange} disabled={availableSubCategories.length === 0} className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700 disabled:opacity-50">
                        <option value="">Select Sub-category (Optional)</option>
                         {availableSubCategories.map((sc, i) => <option key={i} value={sc}>{sc}</option>)}
                    </select>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-cyan-500 text-white font-semibold">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'PERSONAL' | 'BUSINESS'>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
              .from('transactions')
              .select('*')
              .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data.map(supabaseToTransaction));
        } catch (err) {
             if (err instanceof Error) setError(err.message);
             else setError('An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filteredTransactions = useMemo(() => {
        if (filter === 'ALL') return transactions;
        return transactions.filter(t => filter === 'BUSINESS' ? t.category === 'Business' : t.category !== 'Business');
    }, [transactions, filter]);

    const expenseData = useMemo(() => {
        const categories = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                const categoryKey = t.subCategory || t.category;
                acc[categoryKey] = (acc[categoryKey] || 0) + Math.abs(t.amount);
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [filteredTransactions]);
    
    const handleExport = () => {
        exportToCsv('transactions.csv', filteredTransactions);
    };

    const handleSaveTransaction = async (transactionData: Omit<Transaction, 'id'>, id?: string) => {
        try {
            const supabaseData = transactionToSupabase(transactionData);
            let error;
            if (id) {
                // Update
                ({ error } = await supabase.from('transactions').update(supabaseData).eq('id', id));
            } else {
                // Insert
                ({ error } = await supabase.from('transactions').insert(supabaseData));
            }
            if (error) throw error;
            await fetchTransactions(); // Refresh data
        } catch (error) {
            console.error(error);
            if (error instanceof Error) alert(`Error: ${error.message}`);
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction({ ...transaction, amount: Math.abs(transaction.amount) });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            try {
                const { error } = await supabase.from('transactions').delete().eq('id', id);
                if (error) throw error;
                await fetchTransactions(); // Refresh data
            } catch (error) {
                console.error(error);
                if (error instanceof Error) alert(`Error: ${error.message}`);
            }
        }
    };

    const FilterButton: React.FC<{
        label: 'ALL' | 'PERSONAL' | 'BUSINESS';
    }> = ({ label }) => (
        <button
            onClick={() => setFilter(label)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                filter === label
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
        >
            {label.charAt(0) + label.slice(1).toLowerCase()}
        </button>
    );

    return (
        <div className="space-y-8">
            <TransactionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTransaction}
                transaction={editingTransaction}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transactions List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                           <FilterButton label="ALL" />
                           <FilterButton label="PERSONAL" />
                           <FilterButton label="BUSINESS" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={handleExport} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm">
                                Export CSV
                            </button>
                            <button onClick={handleAddNew} className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors text-sm">
                                Add Transaction
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                         {loading && <p>Loading transactions...</p>}
                         {error && <p className="text-red-500">Error: {error}</p>}
                         {!loading && !error && (
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Description</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4 text-right">Amount</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map(tx => (
                                        <tr key={tx.id} className="border-b border-gray-200 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                            <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{tx.date}</td>
                                            <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{tx.description}</td>
                                            <td className="p-4 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{tx.category}</span>
                                                    {tx.subCategory && <span className="text-slate-500">{tx.subCategory}</span>}
                                                </div>
                                            </td>
                                            <td className={`p-4 text-right font-semibold ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                {formatCurrency(tx.amount)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleEdit(tx)} className="text-slate-500 hover:text-cyan-500 p-1">✏️</button>
                                                <button onClick={() => handleDelete(tx.id)} className="text-slate-500 hover:text-red-500 p-1">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         )}
                    </div>
                </div>

                {/* Expense Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">{filter} Expense Categories</h2>
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
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} formatter={(value: number) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {expenseData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span className="text-slate-500 dark:text-slate-400">{entry.name}</span>
                                </div>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(entry.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;