
import React, { useMemo, useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { IconSymbol } from "@/components/IconSymbol";
import { StatCard } from "@/components/StatCard";
import { ProgressRing } from "@/components/ProgressRing";
import { MiniChart } from "@/components/MiniChart";
import GlobalSearch from "@/components/GlobalSearch";
import RealtimeFeed from "@/components/RealtimeFeed";
import { router } from "expo-router";

export default function OwnerDashboard() {
  const theme = useTheme();
  const { userName, userId, userRole, signOut } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const { 
    getVesselsForUser, 
    getMaintenanceTasksForUser, 
    getExpensesForUser,
    getActivityLogsForUser,
    getSupplyRequestsForUser,
    getIssuesForUser
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

  const myIssues = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getIssuesForUser(userId, userRole);
  }, [userId, userRole, getIssuesForUser]);

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

  const lastMonthExpenses = useMemo(() => {
    const lastMonth = new Date().getMonth() - 1;
    const year = lastMonth < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
    const month = lastMonth < 0 ? 11 : lastMonth;
    
    return myExpenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === month && expDate.getFullYear() === year;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [myExpenses]);

  const expenseTrend = useMemo(() => {
    if (lastMonthExpenses === 0) {
      return { direction: 'neutral' as const, value: '0%' };
    }
    const change = ((totalMonthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    return {
      direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const,
      value: `${Math.abs(Math.round(change))}%`
    };
  }, [totalMonthlyExpenses, lastMonthExpenses]);

  const last6MonthsExpenses = useMemo(() => {
    const data: number[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthExpenses = myExpenses
        .filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      data.push(monthExpenses);
    }
    
    return data;
  }, [myExpenses]);

  const upcomingMaintenance = useMemo(() => {
    return myMaintenanceTasks
      .filter(task => task.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  }, [myMaintenanceTasks]);

  const completionRate = useMemo(() => {
    if (myMaintenanceTasks.length === 0) {
      return 0;
    }
    const completed = myMaintenanceTasks.filter(t => t.status === 'completed').length;
    return (completed / myMaintenanceTasks.length) * 100;
  }, [myMaintenanceTasks]);

  const openIssuesCount = useMemo(() => {
    return myIssues.filter(i => i.status !== 'completed').length;
  }, [myIssues]);

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
      <GlobalSearch visible={showSearch} onClose={() => setShowSearch(false)} />
      
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
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setShowSearch(true)} style={styles.searchButton}>
                <IconSymbol 
                  ios_icon_name="magnifyingglass" 
                  android_material_icon_name="search" 
                  size={24} 
                  color={colors.text} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <IconSymbol 
                  ios_icon_name="rectangle.portrait.and.arrow.right" 
                  android_material_icon_name="logout" 
                  size={24} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            </View>
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
          <Text style={styles.sectionTitle}>Fleet Overview</Text>
          <View style={styles.fleetGrid}>
            {myVessels.map((vessel, index) => (
              <View key={vessel.id} style={styles.vesselCard}>
                <View style={styles.vesselHeader}>
                  <IconSymbol 
                    ios_icon_name="sailboat.fill" 
                    android_material_icon_name="sailing" 
                    size={28} 
                    color={colors.accent} 
                  />
                  <View style={[
                    styles.statusDot, 
                    vessel.status === 'active' ? styles.statusDotActive : styles.statusDotMaintenance
                  ]} />
                </View>
                <Text style={styles.vesselName}>{vessel.name}</Text>
                <Text style={styles.vesselLocation}>{vessel.location}</Text>
                <View style={styles.vesselFooter}>
                  <View style={styles.vesselStat}>
                    <IconSymbol 
                      ios_icon_name="person.2.fill" 
                      android_material_icon_name="groups" 
                      size={14} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.vesselStatText}>{vessel.crewCount}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    vessel.status === 'active' ? styles.statusActive : styles.statusMaintenance
                  ]}>
                    <Text style={styles.statusText}>{vessel.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              icon="dollarsign.circle.fill"
              androidIcon="payments"
              iconColor={colors.success}
              label="Monthly Expenses"
              value={`$${totalMonthlyExpenses.toLocaleString()}`}
              subtext="Current month"
              trend={expenseTrend.direction}
              trendValue={expenseTrend.value}
              onPress={handleViewAnalytics}
            />

            <StatCard
              icon="wrench.and.screwdriver.fill"
              androidIcon="build"
              iconColor={colors.warning}
              label="Active Tasks"
              value={myMaintenanceTasks.filter(t => t.status !== 'completed').length}
              subtext={`${myMaintenanceTasks.length} total`}
              onPress={() => router.push('/(tabs)/maintenance')}
            />

            <StatCard
              icon="exclamationmark.triangle.fill"
              androidIcon="warning"
              iconColor={colors.danger}
              label="Open Issues"
              value={openIssuesCount}
              subtext={openIssuesCount > 0 ? 'Needs attention' : 'All clear'}
              onPress={() => router.push('/(tabs)/issues')}
            />

            <StatCard
              icon="shippingbox.fill"
              androidIcon="inventory_2"
              iconColor={colors.accent}
              label="Pending Approvals"
              value={pendingApprovals.length}
              subtext="Supply requests"
              onPress={handleApproveRequests}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          
          <View style={styles.performanceCard}>
            <View style={styles.performanceLeft}>
              <ProgressRing
                progress={completionRate}
                size={100}
                strokeWidth={10}
                color={colors.success}
                label="Complete"
              />
            </View>
            <View style={styles.performanceRight}>
              <Text style={styles.performanceTitle}>Task Completion</Text>
              <Text style={styles.performanceValue}>
                {myMaintenanceTasks.filter(t => t.status === 'completed').length} of {myMaintenanceTasks.length}
              </Text>
              <Text style={styles.performanceSubtext}>
                {myMaintenanceTasks.filter(t => t.status !== 'completed').length} tasks remaining
              </Text>
            </View>
          </View>

          <View style={styles.expenseChartCard}>
            <View style={styles.expenseChartHeader}>
              <Text style={styles.expenseChartTitle}>Expense Trend</Text>
              <Text style={styles.expenseChartSubtitle}>Last 6 months</Text>
            </View>
            <MiniChart data={last6MonthsExpenses} color={colors.success} height={80} />
          </View>
        </View>

        {upcomingMaintenance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Maintenance</Text>
            <View style={styles.maintenanceCard}>
              <View style={styles.maintenanceHeader}>
                <View style={[styles.iconCircle, { backgroundColor: colors.warning + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="wrench.and.screwdriver.fill" 
                    android_material_icon_name="build" 
                    size={24} 
                    color={colors.warning} 
                  />
                </View>
                <View style={styles.maintenanceInfo}>
                  <Text style={styles.maintenanceTitle}>{upcomingMaintenance.title}</Text>
                  <Text style={styles.maintenanceVessel}>{upcomingMaintenance.vesselName}</Text>
                </View>
              </View>
              <View style={styles.maintenanceFooter}>
                <View style={styles.maintenanceDue}>
                  <IconSymbol 
                    ios_icon_name="clock.fill" 
                    android_material_icon_name="schedule" 
                    size={16} 
                    color={colors.textSecondary} 
                  />
                  <Text style={styles.maintenanceDueText}>
                    Due in {getDaysUntil(upcomingMaintenance.dueDate)} days
                  </Text>
                </View>
                <View style={[
                  styles.priorityBadge,
                  upcomingMaintenance.priority === 'high' || upcomingMaintenance.priority === 'urgent' 
                    ? styles.priorityHigh 
                    : upcomingMaintenance.priority === 'medium' 
                    ? styles.priorityMedium 
                    : styles.priorityLow
                ]}>
                  <Text style={styles.priorityText}>{upcomingMaintenance.priority.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {pendingApprovals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Approvals</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingApprovals.length}</Text>
              </View>
            </View>
            {pendingApprovals.slice(0, 2).map((approval, index) => (
              <View key={approval.id} style={styles.approvalCard}>
                <View style={styles.approvalHeader}>
                  <View style={styles.approvalLeft}>
                    <Text style={styles.approvalItem}>{approval.itemName}</Text>
                    <Text style={styles.approvalVessel}>{approval.vesselName}</Text>
                  </View>
                  <Text style={styles.approvalAmount}>${approval.estimatedCost}</Text>
                </View>
                <View style={styles.approvalFooter}>
                  <View style={styles.approvalCategory}>
                    <Text style={styles.approvalCategoryText}>{approval.category}</Text>
                  </View>
                  <Text style={styles.approvalQuantity}>
                    {approval.quantity} {approval.unit}
                  </Text>
                </View>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={handleApproveRequests}
            >
              <Text style={styles.viewAllButtonText}>Review All Requests</Text>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={20} 
                color={colors.accent} 
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <RealtimeFeed userId={userId} maxItems={5} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {myActivityLogs.length > 0 ? (
            myActivityLogs.map((log, index) => (
              <View key={log.id} style={styles.activityCard}>
                <View style={[
                  styles.activityIcon,
                  { backgroundColor: 
                    log.type === 'maintenance' || log.type === 'task' ? colors.success + '20' :
                    log.type === 'issue' ? colors.danger + '20' :
                    colors.accent + '20'
                  }
                ]}>
                  <IconSymbol 
                    ios_icon_name={
                      log.type === 'maintenance' || log.type === 'task' ? 'checkmark.circle.fill' :
                      log.type === 'issue' ? 'exclamationmark.triangle.fill' :
                      'info.circle.fill'
                    }
                    android_material_icon_name={
                      log.type === 'maintenance' || log.type === 'task' ? 'check_circle' :
                      log.type === 'issue' ? 'warning' :
                      'info'
                    }
                    size={20} 
                    color={
                      log.type === 'maintenance' || log.type === 'task' ? colors.success :
                      log.type === 'issue' ? colors.danger :
                      colors.accent
                    }
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{log.title}</Text>
                  <Text style={styles.activityDescription}>{log.description}</Text>
                  <Text style={styles.activityTime}>
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
            <Text style={styles.actionButtonText}>View Documents</Text>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchButton: {
    padding: 8,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  fleetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vesselCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vesselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  statusDotMaintenance: {
    backgroundColor: colors.warning,
  },
  vesselName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  vesselLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  vesselFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vesselStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vesselStatText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: colors.success + '20',
  },
  statusMaintenance: {
    backgroundColor: colors.warning + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  performanceCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  performanceLeft: {
    marginRight: 20,
    justifyContent: 'center',
  },
  performanceRight: {
    flex: 1,
    justifyContent: 'center',
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  performanceSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  expenseChartCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expenseChartHeader: {
    marginBottom: 16,
  },
  expenseChartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  expenseChartSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  maintenanceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  maintenanceVessel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  maintenanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maintenanceDue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  maintenanceDueText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityHigh: {
    backgroundColor: colors.danger + '30',
  },
  priorityMedium: {
    backgroundColor: colors.warning + '30',
  },
  priorityLow: {
    backgroundColor: colors.success + '30',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  approvalCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  approvalLeft: {
    flex: 1,
    marginRight: 12,
  },
  approvalItem: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  approvalVessel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  approvalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  approvalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  approvalCategory: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  approvalCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  approvalQuantity: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textTertiary,
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
