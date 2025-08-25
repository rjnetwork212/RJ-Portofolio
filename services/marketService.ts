import type { Asset } from '../types';

// Dalam aplikasi nyata, pemetaan ini harus lebih kuat.
// Idealnya, Anda akan menyimpan 'coingecko_id' bersama aset di database Anda.
const SYMBOL_TO_CG_ID: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'XRP': 'ripple',
    'DOGE': 'dogecoin',
    'ADA': 'cardano',
    'USDT': 'tether',
    'BNB': 'binancecoin',
};

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

interface CoinGeckoMarketData {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    price_change_percentage_24h: number;
}

// Fungsi ini mengambil aset yang diambil dari DB kita (yang memiliki kepemilikan)
// dan memperkayanya dengan data pasar langsung dari CoinGecko.
export const enrichAssetsWithMarketData = async (dbAssets: Asset[]): Promise<Asset[]> => {
    if (dbAssets.length === 0) {
        return [];
    }

    const coingeckoIds = dbAssets.map(asset => SYMBOL_TO_CG_ID[asset.symbol.toUpperCase()]).filter(Boolean);

    if (coingeckoIds.length === 0) {
        console.warn("Tidak ada aset dengan ID CoinGecko yang dapat dipetakan ditemukan.");
        return dbAssets; // Kembalikan data asli jika tidak ada ID yang dapat dipetakan
    }

    try {
        const response = await fetch(`${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${coingeckoIds.join(',')}`);
        if (!response.ok) {
            throw new Error(`Permintaan API CoinGecko gagal: ${response.statusText}`);
        }
        const marketData: CoinGeckoMarketData[] = await response.json();

        // Buat peta untuk pencarian cepat
        const marketDataMap = new Map<string, CoinGeckoMarketData>();
        marketData.forEach(data => marketDataMap.set(data.symbol.toUpperCase(), data));

        // Perkaya aset asli dengan data baru
        return dbAssets.map(asset => {
            const liveData = marketDataMap.get(asset.symbol.toUpperCase());
            if (liveData) {
                return {
                    ...asset,
                    price: liveData.current_price,
                    change24h: liveData.price_change_percentage_24h,
                    marketCap: liveData.market_cap,
                    logo: liveData.image, // Gunakan logo berkualitas lebih tinggi dari API
                    name: liveData.name,
                };
            }
            return asset; // Kembalikan aset asli jika tidak ada data langsung yang ditemukan
        });

    } catch (error) {
        console.error("Gagal mengambil atau memproses data pasar:", error);
        // Jika terjadi kesalahan, kembalikan data asli dari DB
        // agar pengguna masih melihat sesuatu.
        return dbAssets;
    }
};
