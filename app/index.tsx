
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check once
    if (hasChecked.current) {
      return;
    }

    hasChecked.current = true;

    const checkAuthAndRedirect = async () => {
      try {
        const authToken = await AsyncStorage.getItem('authToken');
        if (!authToken) {
          router.replace('/login');
          return;
        }
        const userRole = await AsyncStorage.getItem('userRole');
        if (userRole === 'owner') router.replace('/(tabs)/owner');
        else if (userRole === 'manager') router.replace('/(tabs)/manager');
        else if (userRole === 'crew') router.replace('/(tabs)/crew');
        else router.replace('/login');
      } catch {
        router.replace('/login');
      }
    };

    checkAuthAndRedirect();
  }, []); // Empty dependency array - only run once on mount

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.gold} />
    </View>
  );
}
