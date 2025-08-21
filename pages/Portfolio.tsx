import React, { useState, useEffect } from 'react';
import type { Asset } from '../types';
import { formatCurrency } from '../utils/helpers';
import { supabase } from '../lib/supabaseClient';

const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toString();
};

const supabaseToAsset = (item: any): Asset => ({
  id: item.id,
  name: item.name,
  symbol: item.symbol,
  price: item.price,
  change24h: item.change_24h,
  marketCap: item.market_cap,
  holdings: item.holdings,
  logo: item.logo,
});

const AssetTable: React.FC<{ title: string, assets: Asset[], isLoading: boolean, error: string | null }> = ({ title, assets, isLoading, error }) => (
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
                    {isLoading && (
                        <tr><td colSpan={6} className="text-center p-4">Loading assets...</td></tr>
                    )}
                    {error && (
                         <tr><td colSpan={6} className="text-center p-4 text-red-500">{error}</td></tr>
                    )}
                    {!isLoading && !error && assets.map(asset => (
                        <tr key={asset.id} className="border-b border-gray-200 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                            <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                                <div className="flex items-center">
                                    <img src={asset.logo} alt={asset.name} className="w-8 h-8 mr-4 rounded-full bg-white p-1" />
                                    <div>
                                        <span>{asset.name}</span>
                                        <span className="text-slate-500 dark:text-slate-500 ml-2">{asset.symbol}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">{formatCurrency(asset.price)}</td>
                            <td className={`p-4 font-semibold ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {asset.change24h.toFixed(2)}%
                            </td>
                            <td className="p-4">{asset.holdings}</td>
                            <td className="p-4 font-semibold">{formatCurrency(asset.holdings * asset.price)}</td>
                            <td className="p-4">{formatMarketCap(asset.marketCap)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const Portfolio: React.FC = () => {
    const [cryptoAssets, setCryptoAssets] = useState<Asset[]>([]);
    const [stockAssets, setStockAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState({ crypto: true, stocks: true });
    const [error, setError] = useState<{ crypto: string | null, stocks: string | null }>({ crypto: null, stocks: null });

    useEffect(() => {
        const fetchAssets = async (assetType: 'crypto' | 'stocks') => {
            const tableName = assetType === 'crypto' ? 'crypto_assets' : 'stock_assets';
            try {
                setLoading(prev => ({ ...prev, [assetType]: true }));

                const { data, error } = await supabase.from(tableName).select('*');
                if (error) throw error;

                const mappedData = data.map(supabaseToAsset);
                if (assetType === 'crypto') setCryptoAssets(mappedData);
                else setStockAssets(mappedData);

            } catch (err: any) {
                setError(prev => ({ ...prev, [assetType]: err.message }));
            } finally {
                setLoading(prev => ({ ...prev, [assetType]: false }));
            }
        };

        fetchAssets('crypto');
        fetchAssets('stocks');
    }, []);

    return (
        <div className="space-y-8">
            <AssetTable 
                title="Cryptocurrency Assets" 
                assets={cryptoAssets} 
                isLoading={loading.crypto} 
                error={error.crypto} 
            />
            <AssetTable 
                title="Stock Assets" 
                assets={stockAssets} 
                isLoading={loading.stocks} 
                error={error.stocks} 
            />
        </div>
    );
};

export default Portfolio;