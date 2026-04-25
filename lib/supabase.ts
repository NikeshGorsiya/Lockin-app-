import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brgjmyvxwmewnfnlogjz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZ2pteXZ4d21ld25mbmxvZ2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjU0MjMsImV4cCI6MjA5MjcwMTQyM30.kc-w5H7tDCtjtF1a1_6iIqWNJNHf8Ulp1KEdVGqWcA4';

// SecureStore has a 2048 byte limit per key, so we chunk large values
const SecureStoreAdapter = {
  getItem: async (key: string) => {
    const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunkCount) {
      let value = '';
      for (let i = 0; i < parseInt(chunkCount); i++) {
        value += (await SecureStore.getItemAsync(`${key}_chunk_${i}`)) ?? '';
      }
      return value;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (value.length > 1800) {
      const chunks = Math.ceil(value.length / 1800);
      await SecureStore.setItemAsync(`${key}_chunks`, String(chunks));
      for (let i = 0; i < chunks; i++) {
        await SecureStore.setItemAsync(`${key}_chunk_${i}`, value.slice(i * 1800, (i + 1) * 1800));
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string) => {
    const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunkCount) {
      for (let i = 0; i < parseInt(chunkCount); i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}_chunks`);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
