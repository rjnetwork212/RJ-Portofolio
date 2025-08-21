import React from 'react';
import { MOCK_CRYPTO_ASSETS, MOCK_STOCK_ASSETS } from '../constants';
import type { Asset } from '../types';

const formatCurrency = (value: number, minimumFractionDigits = 2) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits }).format(value);
const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toString();
};

const AssetTable: React.FC<{ title: string, assets: Asset[] }> = ({ title, assets }) => (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-slate-100 mb-6">{title}</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-slate-700 text-sm text-slate-400">
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
                    {assets.map(asset => (
                        <tr key={asset.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50">
                            <td className="p-4 font-medium text-slate-200">
                                <div className="flex items-center">
                                    <img src={asset.logo} alt={asset.name} className="w-8 h-8 mr-4 rounded-full bg-white p-1" />
                                    <div>
                                        <span>{asset.name}</span>
                                        <span className="text-slate-500 ml-2">{asset.symbol}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">{formatCurrency(asset.price)}</td>
                            <td className={`p-4 font-semibold ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
    return (
        <div className="space-y-8">
            <AssetTable title="Cryptocurrency Assets" assets={MOCK_CRYPTO_ASSETS} />
            <AssetTable title="Stock Assets" assets={MOCK_STOCK_ASSETS} />
        </div>
    );
};

export default Portfolio;
