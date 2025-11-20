
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { IconSymbol } from "@/components/IconSymbol";

const USERS = [
  { role: 'owner', name: 'John Smith', id: 'owner1', vessels: 'Azure Dream, Sea Breeze', icon: 'crown.fill', iconAndroid: 'workspace_premium', color: colors.gold },
  { role: 'owner', name: 'Emily Brown', id: 'owner2', vessels: 'Ocean Pearl', icon: 'crown.fill', iconAndroid: 'workspace_premium', color: colors.gold },
  { role: 'manager', name: 'Sarah Johnson', id: 'manager1', vessels: 'Azure Dream, Sea Breeze', icon: 'chart.bar.fill', iconAndroid: 'dashboard', color: colors.accent },
  { role: 'manager', name: 'Tom Wilson', id: 'manager2', vessels: 'Ocean Pearl', icon: 'chart.bar.fill', iconAndroid: 'dashboard', color: colors.accent },
  { role: 'crew', name: 'Mike Davis', id: 'crew1', vessels: 'Azure Dream, Sea Breeze', icon: 'person.2.fill', iconAndroid: 'groups', color: colors.success },
  { role: 'crew', name: 'Jane Smith', id: 'crew3', vessels: 'Ocean Pearl', icon: 'person.2.fill', iconAndroid: 'groups', color: colors.success },
];

export default function HomeScreen() {
  const theme = useTheme();
  const { setUserRole, setUserName, setUserId } = useAuth();

  const handleRoleSelect = (role: 'owner' | 'manager' | 'crew', name: string, id: string) => {
    console.log('Role selected:', role, 'User ID:', id);
    setUserRole(role);
    setUserName(name);
    setUserId(id);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="sailboat.fill" 
            android_material_icon_name="sailing" 
            size={64} 
            color={colors.accent} 
          />
          <Text style={styles.appTitle}>Vessel & Co.</Text>
          <Text style={styles.subtitle}>Select your profile to continue</Text>
        </View>

        <View style={styles.rolesContainer}>
          {USERS.map((user, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.roleCard}
              onPress={() => handleRoleSelect(user.role as 'owner' | 'manager' | 'crew', user.name, user.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIconContainer, { backgroundColor: user.color + '20' }]}>
                <IconSymbol 
                  ios_icon_name={user.icon} 
                  android_material_icon_name={user.iconAndroid} 
                  size={28} 
                  color={user.color} 
                />
              </View>
              <View style={styles.roleContent}>
                <Text style={styles.roleName}>{user.name}</Text>
                <Text style={styles.roleType}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
                <Text style={styles.roleVessels}>{user.vessels}</Text>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rolesContainer: {
    width: '100%',
    gap: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 2,
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleContent: {
    flex: 1,
  },
  roleName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  roleType: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  roleVessels: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
