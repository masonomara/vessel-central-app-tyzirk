
import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const router = useRouter();
  const hasChecked = useRef(false);

  const checkAuthAndRedirect = useCallback(async () => {
    // Only check once
    if (hasChecked.current) {
      console.log('Already checked auth, skipping...');
      return;
    }
    
    hasChecked.current = true;
    console.log('Checking initial authentication...');
    
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (authToken) {
        console.log('User is authenticated, redirecting to home');
        router.replace('/(tabs)/(home)');
      } else {
        console.log('User is not authenticated, redirecting to login');
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.gold} />
    </View>
  );
}
