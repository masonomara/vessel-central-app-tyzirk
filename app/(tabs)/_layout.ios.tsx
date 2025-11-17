
import React, { useEffect } from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { colors } from '@/styles/commonStyles';

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

  if (!userRole) {
    // Show home tab only when no role is selected
    return (
      <NativeTabs>
        <NativeTabs.Trigger key="home" name="(home)">
          <Icon sf="house.fill" />
          <Label>Home</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="profile" name="profile">
          <Icon sf="person.fill" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  if (userRole === 'owner') {
    return (
      <NativeTabs>
        <NativeTabs.Trigger key="owner" name="owner">
          <Icon sf="star.fill" />
          <Label>Dashboard</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="profile" name="profile">
          <Icon sf="person.fill" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  if (userRole === 'manager') {
    return (
      <NativeTabs>
        <NativeTabs.Trigger key="manager" name="manager">
          <Icon sf="chart.bar.fill" />
          <Label>Dashboard</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="profile" name="profile">
          <Icon sf="person.fill" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  if (userRole === 'crew') {
    return (
      <NativeTabs>
        <NativeTabs.Trigger key="crew" name="crew">
          <Icon sf="list.bullet" />
          <Label>Tasks</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="profile" name="profile">
          <Icon sf="person.fill" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // Fallback
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon sf="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
