import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { MOCK_INVOICES } from '../constants';
import type { Invoice } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const Business: React.FC = () => {
    const totalRevenue = MOCK_INVOICES.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
    const pendingRevenue = MOCK_INVOICES.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + i.amount, 0);
    const profit = totalRevenue * 0.45; // Assuming a 45% profit margin for demo
    
    const getStatusBadge = (status: Invoice['status']) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-500/10 text-green-500';
            case 'PENDING':
                return 'bg-yellow-500/10 text-yellow-500';
            case 'OVERDUE':
                return 'bg-red-500/10 text-red-500';
        }
    };

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Revenue" value={formatCurrency(totalRevenue)} change={5.2} icon={<span>📊</span>} />
                <DashboardCard title="Est. Profit" value={formatCurrency(profit)} change={4.8} icon={<span>💰</span>} />
                <DashboardCard title="Pending Revenue" value={formatCurrency(pendingRevenue)} icon={<span>⏳</span>} />
                <DashboardCard title="Overdue Invoices" value={MOCK_INVOICES.filter(i => i.status === 'OVERDUE').length.toString()} icon={<span>❗️</span>} />
            </div>
            
            {/* Invoices Table */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Invoices</h2>
                    <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors">
                        Create Invoice
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="p-4">Invoice ID</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Due Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_INVOICES.map(invoice => (
                                <tr key={invoice.id} className="border-b border-gray-200 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="p-4 font-medium text-slate-500 dark:text-slate-400">#{invoice.id}</td>
                                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{invoice.client}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400">{invoice.dueDate}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                                        {formatCurrency(invoice.amount)}
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

export default Business;
