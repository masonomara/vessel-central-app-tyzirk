
import React from 'react';
import { Tabs } from 'expo-router/unstable-native-tabs';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { View, Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { userRole } = useAuth();
  const { notifications } = useData();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Owner tabs
  if (userRole === 'owner') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="owner"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <IconSymbol ios_icon_name="chart.bar.fill" android_material_icon_name="dashboard" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="maintenance"
          options={{
            title: 'Maintenance',
            tabBarIcon: ({ color }) => (
              <IconSymbol ios_icon_name="wrench.and.screwdriver.fill" android_material_icon_name="build" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="documents"
          options={{
            title: 'Documents',
            tabBarIcon: ({ color }) => (
              <IconSymbol ios_icon_name="doc.text.fill" android_material_icon_name="description" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <View>
                <IconSymbol ios_icon_name="person.fill" android_material_icon_name="person" size={24} color={color} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen name="(home)" options={{ href: null }} />
        <Tabs.Screen name="manager" options={{ href: null }} />
        <Tabs.Screen name="crew" options={{ href: null }} />
        <Tabs.Screen name="issues" options={{ href: null }} />
        <Tabs.Screen name="supplies" options={{ href: null }} />
      </Tabs>
    );
  }

  // Manager tabs
  if (userRole === 'manager') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="manager"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <IconSymbol ios_icon_name="chart.bar.fill" android_material_icon_name="dashboard" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="maintenance"
          options={{
            title: 'Maintenance',
            tabBarIcon: ({ color }) => (
              <IconSymbol ios_icon_name="wrench.and.screwdriver.fill" android_material_icon_name="build" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="issues"
          options={{
            title: 'Issues',
            tabBarIcon: ({ color }) => (
              <IconSymbol ios_icon_name="exclamationmark.triangle.fill" android_material_icon_name="report_problem" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="supplies"
          options={{
            title: 'Supplies',
            tabBarIcon: ({ color }) => (
              <IconSymbol ios_icon_name="shippingbox.fill" android_material_icon_name="inventory_2" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <View>
                <IconSymbol ios_icon_name="person.fill" android_material_icon_name="person" size={24} color={color} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen name="(home)" options={{ href: null }} />
        <Tabs.Screen name="owner" options={{ href: null }} />
        <Tabs.Screen name="crew" options={{ href: null }} />
        <Tabs.Screen name="documents" options={{ href: null }} />
      </Tabs>
    );
  }

  // Crew tabs
  if (userRole === 'crew') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.success,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="crew"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color }) => (
              <IconSymbol ios_icon_name="list.bullet" android_material_icon_name="list" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="issues"
          options={{
            title: 'Issues',
            tabBarIcon: ({ color }) => (
              <IconSymbol ios_icon_name="exclamationmark.triangle.fill" android_material_icon_name="report_problem" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="supplies"
          options={{
            title: 'Supplies',
            tabBarIcon: ({ color }) => (
              <IconSymbol ios_icon_name="shippingbox.fill" android_material_icon_name="inventory_2" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <View>
                <IconSymbol ios_icon_name="person.fill" android_material_icon_name="person" size={24} color={color} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen name="(home)" options={{ href: null }} />
        <Tabs.Screen name="owner" options={{ href: null }} />
        <Tabs.Screen name="manager" options={{ href: null }} />
        <Tabs.Screen name="maintenance" options={{ href: null }} />
        <Tabs.Screen name="documents" options={{ href: null }} />
      </Tabs>
    );
  }

  // Default (no role selected)
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol ios_icon_name="house.fill" android_material_icon_name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="owner" options={{ href: null }} />
      <Tabs.Screen name="manager" options={{ href: null }} />
      <Tabs.Screen name="crew" options={{ href: null }} />
      <Tabs.Screen name="maintenance" options={{ href: null }} />
      <Tabs.Screen name="issues" options={{ href: null }} />
      <Tabs.Screen name="supplies" options={{ href: null }} />
      <Tabs.Screen name="documents" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
});
