import { supabase } from '../lib/supabaseClient';

/**
 * Memanggil Supabase Edge Function untuk menyinkronkan data bursa.
 * Fungsi ini mengasumsikan Anda telah membuat Edge Function bernama 'sync-exchanges'
 * di proyek Supabase Anda.
 * 
 * Fungsi backend harus:
 * 1. Mengambil kunci API pengguna yang diautentikasi dari tabel 'exchange_connections'.
 * 2. Menghubungi API setiap bursa untuk mengambil saldo saat ini.
 * 3. Memperbarui tabel 'crypto_assets' dengan kepemilikan yang sebenarnya.
 */
export const syncExchangeData = async (): Promise<{ message: string }> => {
  const { data, error } = await supabase.functions.invoke('sync-exchanges');

  if (error) {
    // Error CORS dari `invoke` sering kali muncul sebagai TypeError umum di browser.
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
        throw new Error('CORS policy error. Please ensure your Supabase Edge Function includes the correct CORS headers.');
    }
    throw new Error(error.message || "Failed to sync exchange data.");
  }

  return data;
};