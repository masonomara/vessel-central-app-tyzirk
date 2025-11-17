
import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { IconSymbol } from "@/components/IconSymbol";
import { router } from "expo-router";

export default function OwnerDashboard() {
  const theme = useTheme();
  const { userName, setUserRole } = useAuth();

  const handleLogout = () => {
    console.log('Logging out');
    setUserRole(null);
    router.replace('/(tabs)/(home)/');
  };

  const vesselData = {
    name: "Azure Dream",
    status: "At Marina",
    location: "Monaco Yacht Club",
    nextMaintenance: "Engine Service - 15 days",
    upcomingCharter: "Mediterranean Tour - 22 days",
    monthlyExpenses: "$45,230",
  };

  const recentUpdates = [
    { id: 1, title: "Maintenance Completed", description: "Hull cleaning and inspection", time: "2 hours ago", type: "success" },
    { id: 2, title: "Expense Report", description: "Fuel and provisions - $8,450", time: "5 hours ago", type: "warning" },
    { id: 3, title: "Charter Booking", description: "New booking for July 15-22", time: "1 day ago", type: "info" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={commonStyles.title}>{userName}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <IconSymbol 
                ios_icon_name="rectangle.portrait.and.arrow.right" 
                android_material_icon_name="logout" 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.roleTag}>
            <IconSymbol 
              ios_icon_name="crown.fill" 
              android_material_icon_name="workspace_premium" 
              size={16} 
              color={colors.gold} 
            />
            <Text style={styles.roleText}>Owner</Text>
          </View>
        </View>

        <View style={styles.vesselCard}>
          <View style={styles.vesselHeader}>
            <IconSymbol 
              ios_icon_name="sailboat.fill" 
              android_material_icon_name="sailing" 
              size={32} 
              color={colors.accent} 
            />
            <Text style={styles.vesselName}>{vesselData.name}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, styles.statusActive]}>
              <Text style={styles.statusText}>{vesselData.status}</Text>
            </View>
          </View>
          <View style={styles.vesselInfo}>
            <View style={styles.infoRow}>
              <IconSymbol 
                ios_icon_name="location.fill" 
                android_material_icon_name="location_on" 
                size={20} 
                color={colors.textSecondary} 
              />
              <Text style={styles.infoText}>{vesselData.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <IconSymbol 
                ios_icon_name="wrench.and.screwdriver.fill" 
                android_material_icon_name="build" 
                size={28} 
                color={colors.warning} 
              />
              <Text style={styles.statLabel}>Next Maintenance</Text>
              <Text style={styles.statValue}>{vesselData.nextMaintenance}</Text>
            </View>

            <View style={[styles.statCard, styles.statCardSecondary]}>
              <IconSymbol 
                ios_icon_name="calendar.badge.clock" 
                android_material_icon_name="event" 
                size={28} 
                color={colors.accent} 
              />
              <Text style={styles.statLabel}>Upcoming Charter</Text>
              <Text style={styles.statValue}>{vesselData.upcomingCharter}</Text>
            </View>
          </View>

          <View style={styles.expenseCard}>
            <View style={styles.expenseHeader}>
              <IconSymbol 
                ios_icon_name="dollarsign.circle.fill" 
                android_material_icon_name="payments" 
                size={28} 
                color={colors.success} 
              />
              <Text style={styles.expenseTitle}>Monthly Expenses</Text>
            </View>
            <Text style={styles.expenseAmount}>{vesselData.monthlyExpenses}</Text>
            <Text style={styles.expenseSubtext}>Current month to date</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Updates</Text>
          {recentUpdates.map((update) => (
            <View key={update.id} style={styles.updateCard}>
              <View style={styles.updateIcon}>
                <IconSymbol 
                  ios_icon_name={
                    update.type === 'success' ? 'checkmark.circle.fill' :
                    update.type === 'warning' ? 'exclamationmark.circle.fill' :
                    'info.circle.fill'
                  }
                  android_material_icon_name={
                    update.type === 'success' ? 'check_circle' :
                    update.type === 'warning' ? 'warning' :
                    'info'
                  }
                  size={24} 
                  color={
                    update.type === 'success' ? colors.success :
                    update.type === 'warning' ? colors.warning :
                    colors.accent
                  }
                />
              </View>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>{update.title}</Text>
                <Text style={styles.updateDescription}>{update.description}</Text>
                <Text style={styles.updateTime}>{update.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol 
              ios_icon_name="doc.text.fill" 
              android_material_icon_name="description" 
              size={24} 
              color={colors.text} 
            />
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol 
              ios_icon_name="checkmark.circle.fill" 
              android_material_icon_name="check_circle" 
              size={24} 
              color={colors.text} 
            />
            <Text style={styles.actionButtonText}>Approve Requests</Text>
          </TouchableOpacity>
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
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  logoutButton: {
    padding: 8,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  roleText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  vesselCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vesselHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  vesselName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statusRow: {
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: colors.success + '30',
  },
  statusText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  vesselInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  statCardSecondary: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  expenseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  expenseAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 4,
  },
  expenseSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  updateCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  updateIcon: {
    marginRight: 12,
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  updateDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  updateTime: {
    fontSize: 12,
    color: colors.grey,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
