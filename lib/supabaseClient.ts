import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types_db'; // Assuming you generate types from your schema

// IMPORTANT: Replace with your actual Supabase URL and Anon Key
const supabaseUrl = 'https://ynwyielsercktfvzqbof.supabase.co'; // e.g., 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud3lpZWxzZXJja3RmdnpxYm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MTMyOTksImV4cCI6MjA3MTM4OTI5OX0.nFGnCBTUNZa4xCQEvwkhGIEKR7YKmhrzKLsrPlIX1So';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL and Anon Key are required. Please update lib/supabaseClient.ts'
  );
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
