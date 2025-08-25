import { supabase } from '../lib/supabaseClient';

/**
 * Kelas error kustom untuk mengidentifikasi kegagalan CORS secara spesifik.
 */
export class CorsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CorsError';
  }
}

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
  // Menambahkan body kosong memastikan header Content-Type diatur dengan benar,
  // yang sangat penting untuk permintaan preflight CORS yang berhasil.
  const { data, error } = await supabase.functions.invoke('sync-exchanges', {
    body: {},
  });

  if (error) {
    // Error CORS dari `invoke` sering kali muncul sebagai TypeError umum di browser.
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
        throw new CorsError('It seems the Edge Function is not responding correctly. This is often a CORS issue caused by the function not being deployed yet. Please follow the instructions to deploy your function.');
    }
    throw new Error(error.message || "Failed to sync exchange data.");
  }

  return data;
};