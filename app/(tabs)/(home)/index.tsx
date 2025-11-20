
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles, buttonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { IconSymbol } from "@/components/IconSymbol";

export default function HomeScreen() {
  const theme = useTheme();
  const { userRole, setUserRole, setUserName, setUserId } = useAuth();

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
            onPress={() => handleRoleSelect('owner', 'John Smith', 'owner1')}
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
              <Text style={styles.roleTitle}>Owner - John Smith</Text>
              <Text style={styles.roleDescription}>
                View Azure Dream & Sea Breeze status, maintenance, expenses
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
            style={[styles.roleCard, styles.ownerCard]}
            onPress={() => handleRoleSelect('owner', 'Emily Brown', 'owner2')}
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
              <Text style={styles.roleTitle}>Owner - Emily Brown</Text>
              <Text style={styles.roleDescription}>
                View Ocean Pearl status, maintenance, expenses
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
            onPress={() => handleRoleSelect('manager', 'Sarah Johnson', 'manager1')}
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
              <Text style={styles.roleTitle}>Manager - Sarah Johnson</Text>
              <Text style={styles.roleDescription}>
                Manage Azure Dream & Sea Breeze operations, crew, maintenance
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
            onPress={() => handleRoleSelect('manager', 'Tom Wilson', 'manager2')}
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
              <Text style={styles.roleTitle}>Manager - Tom Wilson</Text>
              <Text style={styles.roleDescription}>
                Manage Ocean Pearl operations, crew, maintenance
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
            onPress={() => handleRoleSelect('crew', 'Mike Davis', 'crew1')}
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
              <Text style={styles.roleTitle}>Crew - Mike Davis</Text>
              <Text style={styles.roleDescription}>
                Complete tasks on Azure Dream & Sea Breeze, submit reports
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
            onPress={() => handleRoleSelect('crew', 'Jane Smith', 'crew3')}
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
              <Text style={styles.roleTitle}>Crew - Jane Smith</Text>
              <Text style={styles.roleDescription}>
                Complete tasks on Ocean Pearl, submit reports
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
            Select a role to access your personalized dashboard
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
