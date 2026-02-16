
import React, { useEffect, useCallback, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { userRole } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasRedirected = useRef(false);

  const handleRoleRedirect = useCallback(() => {
    console.log('Current role:', userRole);
    console.log('Current segments:', segments);

    // Only redirect once when role is set and we're on home
    if (userRole && segments[1] === '(home)' && !hasRedirected.current) {
      hasRedirected.current = true;
      // Redirect to appropriate dashboard based on role
      if (userRole === 'owner') {
        router.replace('/(tabs)/owner');
      } else if (userRole === 'manager') {
        router.replace('/(tabs)/manager');
      } else if (userRole === 'crew') {
        router.replace('/(tabs)/crew');
      }
    }
  }, [userRole, segments, router]);

  useEffect(() => {
    handleRoleRedirect();
  }, [handleRoleRedirect]);

  // Reset redirect flag when role changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [userRole]);

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
          icon: 'dashboard',
          label: 'Dashboard',
        },
        {
          name: 'calendar',
          route: '/(tabs)/calendar',
          icon: 'event',
          label: 'Calendar',
        },
        {
          name: 'maintenance',
          route: '/(tabs)/maintenance',
          icon: 'build',
          label: 'Maintenance',
        },
        {
          name: 'documents',
          route: '/(tabs)/documents',
          icon: 'description',
          label: 'Documents',
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
          icon: 'dashboard',
          label: 'Dashboard',
        },
        {
          name: 'calendar',
          route: '/(tabs)/calendar',
          icon: 'event',
          label: 'Calendar',
        },
        {
          name: 'maintenance',
          route: '/(tabs)/maintenance',
          icon: 'build',
          label: 'Maintenance',
        },
        {
          name: 'issues',
          route: '/(tabs)/issues',
          icon: 'report_problem',
          label: 'Issues',
        },
        {
          name: 'supplies',
          route: '/(tabs)/supplies',
          icon: 'inventory_2',
          label: 'Supplies',
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
          name: 'calendar',
          route: '/(tabs)/calendar',
          icon: 'event',
          label: 'Calendar',
        },
        {
          name: 'issues',
          route: '/(tabs)/issues',
          icon: 'report_problem',
          label: 'Issues',
        },
        {
          name: 'supplies',
          route: '/(tabs)/supplies',
          icon: 'inventory_2',
          label: 'Supplies',
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
        <Stack.Screen key="calendar" name="calendar" />
        <Stack.Screen key="maintenance" name="maintenance" />
        <Stack.Screen key="issues" name="issues" />
        <Stack.Screen key="supplies" name="supplies" />
        <Stack.Screen key="documents" name="documents" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
