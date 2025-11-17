
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { userRole } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log('Current role:', userRole);
    console.log('Current segments:', segments);

    if (userRole && segments[1] === '(home)') {
      // Redirect to appropriate dashboard based on role
      if (userRole === 'owner') {
        router.replace('/(tabs)/owner');
      } else if (userRole === 'manager') {
        router.replace('/(tabs)/manager');
      } else if (userRole === 'crew') {
        router.replace('/(tabs)/crew');
      }
    }
  }, [userRole, segments]);

  // Define the tabs configuration based on role
  const getTabsForRole = (): TabBarItem[] => {
    const baseTabs: TabBarItem[] = [
      {
        name: '(home)',
        route: '/(tabs)/(home)/',
        icon: 'home',
        label: 'Home',
      },
    ];

    if (userRole === 'owner') {
      return [
        {
          name: 'owner',
          route: '/(tabs)/owner',
          icon: 'star',
          label: 'Dashboard',
        },
        {
          name: 'profile',
          route: '/(tabs)/profile',
          icon: 'person',
          label: 'Profile',
        },
      ];
    } else if (userRole === 'manager') {
      return [
        {
          name: 'manager',
          route: '/(tabs)/manager',
          icon: 'business',
          label: 'Dashboard',
        },
        {
          name: 'profile',
          route: '/(tabs)/profile',
          icon: 'person',
          label: 'Profile',
        },
      ];
    } else if (userRole === 'crew') {
      return [
        {
          name: 'crew',
          route: '/(tabs)/crew',
          icon: 'list',
          label: 'Tasks',
        },
        {
          name: 'profile',
          route: '/(tabs)/profile',
          icon: 'person',
          label: 'Profile',
        },
      ];
    }

    return baseTabs.concat([
      {
        name: 'profile',
        route: '/(tabs)/profile',
        icon: 'person',
        label: 'Profile',
      },
    ]);
  };

  const tabs = getTabsForRole();

  // For Android and Web, use Stack navigation with custom floating tab bar
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="owner" name="owner" />
        <Stack.Screen key="manager" name="manager" />
        <Stack.Screen key="crew" name="crew" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
