import { createClient } from '@supabase/supabase-js';

// Menggunakan environment variables untuk kredensial Supabase.
// Ini akan dibaca dari Environment Variables di pengaturan Vercel Anda saat di-deploy.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL and Anon Key are required. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your Vercel environment variables.'
  );
}

// Membuat dan mengekspor klien Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);