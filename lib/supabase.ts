// Single shared Supabase client for the whole app.
// Reads the project URL and anon key from environment variables — see .env.example.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast with a clear message instead of confusing network errors later.
  throw new Error(
    'Supabase is not configured. Copy .env.example to .env and fill in ' +
      'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart `npx expo start`.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist the login session on the device so users stay logged in.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // URL-based session detection is a web feature; not relevant in an app.
    detectSessionInUrl: false,
  },
});
