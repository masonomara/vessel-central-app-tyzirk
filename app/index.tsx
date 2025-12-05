
import { useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const router = useRouter();

  const checkAuthAndRedirect = useCallback(async () => {
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
  }, [checkAuthAndRedirect]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.gold} />
    </View>
  );
}
