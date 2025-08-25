import React, { useState } from 'react';
import type { Asset } from '../types';
import { formatCurrency } from '../utils/helpers';
import { usePortfolio } from '../hooks/usePortfolio';
import { syncExchangeData, CorsError } from '../services/exchangeService';

const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toString();
};

const CorsErrorHelp: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
    const [copied, setCopied] = useState(false);
    const cliCommand = 'supabase functions deploy sync-exchanges';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(cliCommand).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-800 dark:text-red-300 p-4 rounded-r-lg" role="alert">
            <p className="font-bold">Action Required: Deploy Your Edge Function</p>
            <p className="mt-2 text-sm">
                The sync feature failed because of a network error, which is almost always a CORS (Cross-Origin Resource Sharing) issue.
            </p>
            <p className="mt-2 text-sm">
                This happens when the backend code in <code>/supabase/functions/sync-exchanges</code> hasn't been deployed to Supabase yet.
            </p>
            <div className="my-4">
                <label className="block text-xs font-semibold mb-1">Run this command in your project terminal:</label>
                <div className="relative">
                    <pre className="bg-slate-800 text-slate-200 p-3 pr-20 rounded-md overflow-x-auto text-xs">
                        <code>{cliCommand}</code>
                    </pre>
                    <button 
                        onClick={copyToClipboard} 
                        className="absolute top-1/2 right-2 -translate-y-1/2 bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-xs font-semibold"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
             <button onClick={onRetry} className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors text-sm">
                I've deployed the function, Retry Sync
            </button>
        </div>
    );
};

const AssetTable: React.FC<{ title: string, assets: Asset[] }> = ({ title, assets }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{title}</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-gray-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                    <tr>
                        <th className="p-4">Asset</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">24h Change</th>
                        <th className="p-4">Holdings</th>
                        <th className="p-4">Value</th>
                        <th className="p-4">Market Cap</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.length === 0 ? (
                         <tr><td colSpan={6} className="text-center p-4 text-slate-500">No assets found.</td></tr>
                    ) : (
                        assets.map(asset => (
                            <tr key={asset.id} className="border-b border-gray-200 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                                    <div className="flex items-center">
                                        <img src={asset.logo} alt={asset.name} className="w-8 h-8 mr-4 rounded-full bg-white p-1" />
                                        <div>
                                            <span>{asset.name}</span>
                                            <span className="text-slate-500 dark:text-slate-500 ml-2">{asset.symbol.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">{formatCurrency(asset.price, asset.price < 1 ? 4 : 2)}</td>
                                <td className={`p-4 font-semibold ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {asset.change24h ? `${asset.change24h.toFixed(2)}%` : '-'}
                                </td>
                                <td className="p-4">{asset.holdings}</td>
                                <td className="p-4 font-semibold">{formatCurrency(asset.holdings * asset.price)}</td>
                                <td className="p-4">{formatMarketCap(asset.marketCap)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const Portfolio: React.FC = () => {
    const { cryptoAssets, stockAssets, loading, error, refresh, totalPortfolioValue } = usePortfolio();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<{ message: string, type: 'cors' | 'generic' } | null>(null);

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncError(null);
        try {
            const { message } = await syncExchangeData();
            console.log(message); // "Sync completed"
            // Setelah sinkronisasi berhasil, panggil refresh untuk mengambil data yang diperbarui.
            await refresh();
        } catch (err) {
            if (err instanceof CorsError) {
                setSyncError({ message: err.message, type: 'cors' });
            } else if (err instanceof Error) {
                setSyncError({ message: err.message, type: 'generic' });
            } else {
                setSyncError({ message: 'An unknown error occurred during sync.', type: 'generic' });
            }
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-sm text-slate-500 dark:text-slate-400">Total Portfolio Value</h2>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                        {loading ? 'Loading...' : formatCurrency(totalPortfolioValue)}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={handleSync} disabled={loading || isSyncing} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-wait w-full">
                        {isSyncing ? 'Syncing...' : 'Sync Exchanges'}
                    </button>
                    <button onClick={refresh} disabled={loading || isSyncing} className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-wait w-full">
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {error && <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">Error: {error}</div>}
            
            {syncError && syncError.type === 'cors' && <CorsErrorHelp onRetry={handleSync} />}
            {syncError && syncError.type === 'generic' && (
                <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">Sync Error: {syncError.message}</div>
            )}


            {loading ? (
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <p className="text-slate-500">Loading portfolio data...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <AssetTable 
                        title="Cryptocurrency Assets" 
                        assets={cryptoAssets} 
                    />
                    <AssetTable 
                        title="Stock Assets" 
                        assets={stockAssets}
                    />
                </div>
            )}
        </div>
    );
};

export default Portfolio;