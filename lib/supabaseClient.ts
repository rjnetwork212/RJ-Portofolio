import { createClient } from '@supabase/supabase-js';

// --- ACTION REQUIRED ---
// Replace these placeholder values with your actual Supabase project's URL and Anon Key.
// You can find these in your Supabase project settings under "API".
const supabaseUrl = 'https://ynwyielsercktfvzqbof.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud3lpZWxzZXJja3RmdnpxYm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MTMyOTksImV4cCI6MjA3MTM4OTI5OX0.nFGnCBTUNZa4xCQEvwkhGIEKR7YKmhrzKLsrPlIX1So';

// This check warns the developer if they haven't updated the credentials.
// It doesn't throw an error, allowing the UI to load so the developer can still explore the app.
if (supabaseUrl.includes('<your-project-id>') || supabaseAnonKey.includes('<your-anon-key>')) {
  console.warn(
    `[Zenith Finance] Supabase is not configured. 
    
Please update the placeholder credentials in 'lib/supabaseClient.ts'.
The application will not be able to fetch or save data until this is done.`
  );
}

// Creates and exports the Supabase client.
// If the credentials are still placeholders, API calls will fail, which is expected.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);