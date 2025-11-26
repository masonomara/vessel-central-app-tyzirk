
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace these with your actual Supabase project credentials
// You can find these in your Supabase project settings under API
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a custom storage implementation for React Native
const customStorage = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  },
};

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const isValidUrl = SUPABASE_URL && 
    SUPABASE_URL.length > 0 && 
    (SUPABASE_URL.startsWith('http://') || SUPABASE_URL.startsWith('https://'));
  
  const isValidKey = SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 0;
  
  return isValidUrl && isValidKey;
};

// Create Supabase client only if properly configured
// Otherwise, use a dummy URL to prevent initialization errors
const getSupabaseClient = () => {
  if (isSupabaseConfigured()) {
    console.log('Supabase is configured, creating client...');
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: customStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } else {
    console.warn('Supabase is not configured. Using placeholder client.');
    console.warn('To enable Supabase:');
    console.warn('1. Create a Supabase project at https://supabase.com');
    console.warn('2. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file');
    console.warn('3. Restart your Expo development server');
    
    // Return a placeholder client with a valid dummy URL to prevent errors
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        storage: customStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
};

export const supabase = getSupabaseClient();
