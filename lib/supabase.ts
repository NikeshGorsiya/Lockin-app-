import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brgjmyvxwmewnfnlogjz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZ2pteXZ4d21ld25mbmxvZ2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjU0MjMsImV4cCI6MjA5MjcwMTQyM30.kc-w5H7tDCtjtF1a1_6iIqWNJNHf8Ulp1KEdVGqWcA4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
