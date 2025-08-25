import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { enrichAssetsWithMarketData } from '../services/marketService';
import type { Asset } from '../types';

const supabaseToAsset = (item: any): Asset => ({
  id: item.id,
  name: item.name,
  symbol: item.symbol,
  price: item.price, // Ini akan diperbarui dengan data langsung
  change24h: item.change_24h, // Ini akan diperbarui
  marketCap: item.market_cap, // Ini akan diperbarui
  holdings: item.holdings,
  logo: item.logo,
});

export const usePortfolio = () => {
    const [cryptoAssets, setCryptoAssets] = useState<Asset[]>([]);
    const [stockAssets, setStockAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPortfolio = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Ambil aset kripto dan saham secara paralel
            const [cryptoResponse, stockResponse] = await Promise.all([
                supabase.from('crypto_assets').select('*'),
                supabase.from('stock_assets').select('*')
            ]);

            if (cryptoResponse.error) throw new Error(`Kesalahan pengambilan Crypto: ${cryptoResponse.error.message}`);
            if (stockResponse.error) throw new Error(`Kesalahan pengambilan Saham: ${stockResponse.error.message}`);
            
            const dbCryptoAssets = cryptoResponse.data.map(supabaseToAsset);
            const dbStockAssets = stockResponse.data.map(supabaseToAsset);

            // Perkaya aset kripto dengan data pasar langsung
            const liveCryptoAssets = await enrichAssetsWithMarketData(dbCryptoAssets);

            setCryptoAssets(liveCryptoAssets);
            setStockAssets(dbStockAssets);

        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError('Terjadi kesalahan yang tidak diketahui saat mengambil portofolio.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    const totalCryptoValue = cryptoAssets.reduce((sum, asset) => sum + (asset.holdings * asset.price), 0);
    const totalStockValue = stockAssets.reduce((sum, asset) => sum + (asset.holdings * asset.price), 0);
    const totalPortfolioValue = totalCryptoValue + totalStockValue;

    return {
        cryptoAssets,
        stockAssets,
        totalPortfolioValue,
        totalCryptoValue,
        totalStockValue,
        loading,
        error,
        refresh: fetchPortfolio,
    };
};
