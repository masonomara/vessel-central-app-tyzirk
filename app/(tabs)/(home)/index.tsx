
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles, buttonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { IconSymbol } from "@/components/IconSymbol";

export default function HomeScreen() {
  const theme = useTheme();
  const { userRole, setUserRole, setUserName } = useAuth();

  const handleRoleSelect = (role: 'owner' | 'manager' | 'crew', name: string) => {
    console.log('Role selected:', role);
    setUserRole(role);
    setUserName(name);
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
            size={80} 
            color={colors.accent} 
          />
          <Text style={[commonStyles.title, styles.appTitle]}>Vessel & Co.</Text>
          <Text style={[commonStyles.textSecondary, styles.subtitle]}>
            Yacht Management System
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          <Text style={[commonStyles.subtitle, styles.sectionTitle]}>Select Your Role</Text>
          
          <TouchableOpacity 
            style={[styles.roleCard, styles.ownerCard]}
            onPress={() => handleRoleSelect('owner', 'John Smith')}
            activeOpacity={0.7}
          >
            <View style={styles.roleIconContainer}>
              <IconSymbol 
                ios_icon_name="crown.fill" 
                android_material_icon_name="workspace_premium" 
                size={48} 
                color={colors.gold} 
              />
            </View>
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Owner</Text>
              <Text style={styles.roleDescription}>
                View vessel status, maintenance, expenses, and approve budgets
              </Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.roleCard, styles.managerCard]}
            onPress={() => handleRoleSelect('manager', 'Sarah Johnson')}
            activeOpacity={0.7}
          >
            <View style={styles.roleIconContainer}>
              <IconSymbol 
                ios_icon_name="chart.bar.fill" 
                android_material_icon_name="dashboard" 
                size={48} 
                color={colors.accent} 
              />
            </View>
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Manager</Text>
              <Text style={styles.roleDescription}>
                Full access to manage operations, crew, maintenance, and schedules
              </Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.roleCard, styles.crewCard]}
            onPress={() => handleRoleSelect('crew', 'Mike Davis')}
            activeOpacity={0.7}
          >
            <View style={styles.roleIconContainer}>
              <IconSymbol 
                ios_icon_name="person.2.fill" 
                android_material_icon_name="groups" 
                size={48} 
                color={colors.success} 
              />
            </View>
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Crew</Text>
              <Text style={styles.roleDescription}>
                Complete tasks, submit reports, log issues, and request supplies
              </Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={commonStyles.textSecondary}>
            Select a role to access the dashboard
          </Text>
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
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 36,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
  },
  rolesContainer: {
    width: '100%',
  },
  sectionTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  ownerCard: {
    borderColor: colors.gold,
  },
  managerCard: {
    borderColor: colors.accent,
  },
  crewCard: {
    borderColor: colors.success,
  },
  roleIconContainer: {
    marginRight: 16,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
