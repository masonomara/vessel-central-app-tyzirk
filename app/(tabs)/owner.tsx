
import React, { useMemo } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { IconSymbol } from "@/components/IconSymbol";
import { router } from "expo-router";

export default function OwnerDashboard() {
  const theme = useTheme();
  const { userName, userId, userRole, signOut } = useAuth();
  const { 
    getVesselsForUser, 
    getMaintenanceTasksForUser, 
    getExpensesForUser,
    getActivityLogsForUser,
    getSupplyRequestsForUser
  } = useData();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("=== LOGOUT INITIATED FROM OWNER DASHBOARD ===");
              
              const { error } = await signOut();
              
              if (error) {
                console.error("Logout error:", error);
                Alert.alert("Error", "Failed to log out. Please try again.");
                return;
              }
              
              console.log("Logout successful, navigating to login...");
              
              setTimeout(() => {
                console.log("Navigating to login screen...");
                router.replace("/login");
              }, 100);
              
            } catch (err) {
              console.error("Logout exception:", err);
              Alert.alert("Error", "An unexpected error occurred. Please try again.");
            }
          }
        }
      ]
    );
  };

  const myVessels = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getVesselsForUser(userId, userRole);
  }, [userId, userRole, getVesselsForUser]);

  const myMaintenanceTasks = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getMaintenanceTasksForUser(userId, userRole);
  }, [userId, userRole, getMaintenanceTasksForUser]);

  const myExpenses = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getExpensesForUser(userId, userRole);
  }, [userId, userRole, getExpensesForUser]);

  const myActivityLogs = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getActivityLogsForUser(userId, userRole).slice(0, 5);
  }, [userId, userRole, getActivityLogsForUser]);

  const mySupplyRequests = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getSupplyRequestsForUser(userId, userRole);
  }, [userId, userRole, getSupplyRequestsForUser]);

  const pendingApprovals = useMemo(() => {
    return mySupplyRequests.filter(req => req.status === 'pending');
  }, [mySupplyRequests]);

  const totalMonthlyExpenses = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return myExpenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [myExpenses]);

  const upcomingMaintenance = useMemo(() => {
    return myMaintenanceTasks
      .filter(task => task.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  }, [myMaintenanceTasks]);

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleViewReports = () => {
    console.log('View reports pressed');
    router.push('/(tabs)/documents');
  };

  const handleApproveRequests = () => {
    console.log('Approve requests pressed');
    router.push('/(tabs)/supplies');
  };

  const handleViewAnalytics = () => {
    console.log('View analytics pressed');
    router.push('/analytics');
  };

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Vessels ({myVessels.length})</Text>
          {myVessels.map((vessel) => (
            <View key={vessel.id} style={styles.vesselCard}>
              <View style={styles.vesselHeader}>
                <IconSymbol 
                  ios_icon_name="sailboat.fill" 
                  android_material_icon_name="sailing" 
                  size={32} 
                  color={colors.accent} 
                />
                <Text style={styles.vesselName}>{vessel.name}</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusBadge, 
                  vessel.status === 'active' ? styles.statusActive : styles.statusMaintenance
                ]}>
                  <Text style={styles.statusText}>{vessel.status.toUpperCase()}</Text>
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
                  <Text style={styles.infoText}>{vessel.location}</Text>
                </View>
                <View style={styles.infoRow}>
                  <IconSymbol 
                    ios_icon_name="person.2.fill" 
                    android_material_icon_name="groups" 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                  <Text style={styles.infoText}>{vessel.crewCount} Crew Members</Text>
                </View>
              </View>
            </View>
          ))}
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
              {upcomingMaintenance ? (
                <React.Fragment>
                  <Text style={styles.statValue}>{upcomingMaintenance.title}</Text>
                  <Text style={styles.statSubtext}>
                    {getDaysUntil(upcomingMaintenance.dueDate)} days
                  </Text>
                </React.Fragment>
              ) : (
                <Text style={styles.statValue}>None scheduled</Text>
              )}
            </View>

            <View style={[styles.statCard, styles.statCardSecondary]}>
              <IconSymbol 
                ios_icon_name="list.bullet" 
                android_material_icon_name="list" 
                size={28} 
                color={colors.accent} 
              />
              <Text style={styles.statLabel}>Active Tasks</Text>
              <Text style={styles.statValue}>
                {myMaintenanceTasks.filter(t => t.status !== 'completed').length}
              </Text>
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
            <Text style={styles.expenseAmount}>
              ${totalMonthlyExpenses.toLocaleString()}
            </Text>
            <Text style={styles.expenseSubtext}>Current month to date</Text>
          </View>

          {pendingApprovals.length > 0 && (
            <View style={styles.pendingCard}>
              <View style={styles.pendingHeader}>
                <IconSymbol 
                  ios_icon_name="exclamationmark.circle.fill" 
                  android_material_icon_name="pending_actions" 
                  size={28} 
                  color={colors.warning} 
                />
                <View style={styles.pendingInfo}>
                  <Text style={styles.pendingTitle}>Pending Approvals</Text>
                  <Text style={styles.pendingSubtext}>
                    {pendingApprovals.length} request{pendingApprovals.length > 1 ? 's' : ''} awaiting review
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.reviewButton}
                onPress={handleApproveRequests}
              >
                <Text style={styles.reviewButtonText}>Review Requests</Text>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {myActivityLogs.length > 0 ? (
            myActivityLogs.map((log) => (
              <View key={log.id} style={styles.updateCard}>
                <View style={styles.updateIcon}>
                  <IconSymbol 
                    ios_icon_name={
                      log.type === 'maintenance' || log.type === 'task' ? 'checkmark.circle.fill' :
                      log.type === 'issue' ? 'exclamationmark.circle.fill' :
                      'info.circle.fill'
                    }
                    android_material_icon_name={
                      log.type === 'maintenance' || log.type === 'task' ? 'check_circle' :
                      log.type === 'issue' ? 'warning' :
                      'info'
                    }
                    size={24} 
                    color={
                      log.type === 'maintenance' || log.type === 'task' ? colors.success :
                      log.type === 'issue' ? colors.warning :
                      colors.accent
                    }
                  />
                </View>
                <View style={styles.updateContent}>
                  <Text style={styles.updateTitle}>{log.title}</Text>
                  <Text style={styles.updateDescription}>{log.description}</Text>
                  <Text style={styles.updateTime}>
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity</Text>
          )}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleViewAnalytics}
          >
            <IconSymbol 
              ios_icon_name="chart.bar.fill" 
              android_material_icon_name="analytics" 
              size={24} 
              color={colors.text} 
            />
            <Text style={styles.actionButtonText}>View Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleViewReports}
          >
            <IconSymbol 
              ios_icon_name="doc.text.fill" 
              android_material_icon_name="description" 
              size={24} 
              color={colors.text} 
            />
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleApproveRequests}
          >
            <IconSymbol 
              ios_icon_name="checkmark.circle.fill" 
              android_material_icon_name="check_circle" 
              size={24} 
              color={colors.text} 
            />
            <Text style={styles.actionButtonText}>
              Approve Requests {pendingApprovals.length > 0 && `(${pendingApprovals.length})`}
            </Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  vesselCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
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
  statusMaintenance: {
    backgroundColor: colors.warning + '30',
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
  statSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expenseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    marginBottom: 12,
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
  pendingCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  pendingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning + '30',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  reviewButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
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
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
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
