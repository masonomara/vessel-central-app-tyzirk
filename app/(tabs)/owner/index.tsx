import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { IconSymbol } from "@/components/IconSymbol";
import { StatCard } from "@/components/StatCard";
import { ProgressRing } from "@/components/ProgressRing";
import { MiniChart } from "@/components/MiniChart";
import { PressableCard } from "@/components/PressableCard";
import { GradientButton } from "@/components/GradientButton";
import GlobalSearch from "@/components/GlobalSearch";
import { ProfileHeaderButton } from "@/components/ProfileHeaderButton";

import { Stack, router } from "expo-router";

export default function OwnerDashboard() {
  const { userName, userId, userRole } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const {
    getVesselsForUser,
    getMaintenanceTasksForUser,
    getExpensesForUser,
    getActivityLogsForUser,
    getSupplyRequestsForUser,
    getIssuesForUser,
  } = useData();

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
    return mySupplyRequests.filter((req) => req.status === "pending");
  }, [mySupplyRequests]);

  const totalMonthlyExpenses = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return myExpenses
      .filter((exp) => {
        const expDate = new Date(exp.date);
        return (
          expDate.getMonth() === currentMonth &&
          expDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [myExpenses]);

  const lastMonthExpenses = useMemo(() => {
    const lastMonth = new Date().getMonth() - 1;
    const year =
      lastMonth < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
    const month = lastMonth < 0 ? 11 : lastMonth;

    return myExpenses
      .filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === month && expDate.getFullYear() === year;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [myExpenses]);

  const expenseTrend = useMemo(() => {
    if (lastMonthExpenses === 0) {
      return { direction: "neutral" as const, value: "0%" };
    }
    const change =
      ((totalMonthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    return {
      direction:
        change > 0
          ? ("up" as const)
          : change < 0
            ? ("down" as const)
            : ("neutral" as const),
      value: `${Math.abs(Math.round(change))}%`,
    };
  }, [totalMonthlyExpenses, lastMonthExpenses]);

  const last6MonthsExpenses = useMemo(() => {
    const data: number[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthExpenses = myExpenses
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return (
            expDate.getMonth() === date.getMonth() &&
            expDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      data.push(monthExpenses);
    }

    return data;
  }, [myExpenses]);

  const upcomingMaintenance = useMemo(() => {
    return myMaintenanceTasks
      .filter((task) => task.status !== "completed")
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      )[0];
  }, [myMaintenanceTasks]);

  const completionRate = useMemo(() => {
    if (myMaintenanceTasks.length === 0) {
      return 0;
    }
    const completed = myMaintenanceTasks.filter(
      (t) => t.status === "completed",
    ).length;
    return (completed / myMaintenanceTasks.length) * 100;
  }, [myMaintenanceTasks]);

  const openIssuesCount = useMemo(() => {
    return myIssues.filter((i) => i.status !== "completed").length;
  }, [myIssues]);

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleViewReports = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/documents");
  };

  const handleApproveRequests = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/supplies");
  };

  const handleViewAnalytics = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/analytics");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Dashboard",
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowSearch(true);
                }}
              >
                <IconSymbol
                  android_material_icon_name="search"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
              <ProfileHeaderButton />
            </View>
          ),
        }}
      />
      <GlobalSearch visible={showSearch} onClose={() => setShowSearch(false)} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={commonStyles.title}>{userName}</Text>
          <View style={styles.roleTag}>
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="workspace-premium"
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
              <PressableCard key={vessel.id} style={styles.vesselCard}>
                <View style={styles.vesselHeader}>
                  <LinearGradient
                    colors={[colors.accent + "30", colors.accent + "10"]}
                    style={styles.vesselIconCircle}
                  >
                    <IconSymbol
                      ios_icon_name="sailboat.fill"
                      android_material_icon_name="sailing"
                      size={28}
                      color={colors.accent}
                    />
                  </LinearGradient>
                  <View
                    style={[
                      styles.statusDot,
                      vessel.status === "active"
                        ? styles.statusDotActive
                        : styles.statusDotMaintenance,
                    ]}
                  />
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
                    <Text style={styles.vesselStatText}>
                      {vessel.crewCount}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      vessel.status === "active"
                        ? styles.statusActive
                        : styles.statusMaintenance,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {vessel.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </PressableCard>
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
              value={
                myMaintenanceTasks.filter((t) => t.status !== "completed")
                  .length
              }
              subtext={`${myMaintenanceTasks.length} total`}
              onPress={() => router.push("/(tabs)/maintenance")}
            />

            <StatCard
              icon="exclamationmark.triangle.fill"
              androidIcon="warning"
              iconColor={colors.danger}
              label="Open Issues"
              value={openIssuesCount}
              subtext={openIssuesCount > 0 ? "Needs attention" : "All clear"}
              onPress={() => router.push("/(tabs)/issues")}
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

          <PressableCard style={styles.performanceCard}>
            <View style={styles.performanceContent}>
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
                  {
                    myMaintenanceTasks.filter((t) => t.status === "completed")
                      .length
                  }{" "}
                  of {myMaintenanceTasks.length}
                </Text>
                <Text style={styles.performanceSubtext}>
                  {
                    myMaintenanceTasks.filter((t) => t.status !== "completed")
                      .length
                  }{" "}
                  tasks remaining
                </Text>
              </View>
            </View>
          </PressableCard>

          <PressableCard style={styles.expenseChartCard}>
            <View style={styles.expenseChartHeader}>
              <Text style={styles.expenseChartTitle}>Expense Trend</Text>
              <Text style={styles.expenseChartSubtitle}>Last 6 months</Text>
            </View>
            <MiniChart
              data={last6MonthsExpenses}
              color={colors.success}
              height={80}
            />
          </PressableCard>
        </View>

        {upcomingMaintenance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Maintenance</Text>
            <PressableCard style={styles.maintenanceCard}>
              <View style={styles.maintenanceHeader}>
                <LinearGradient
                  colors={[colors.warning + "30", colors.warning + "10"]}
                  style={styles.iconCircle}
                >
                  <IconSymbol
                    ios_icon_name="wrench.and.screwdriver.fill"
                    android_material_icon_name="build"
                    size={24}
                    color={colors.warning}
                  />
                </LinearGradient>
                <View style={styles.maintenanceInfo}>
                  <Text style={styles.maintenanceTitle}>
                    {upcomingMaintenance.title}
                  </Text>
                  <Text style={styles.maintenanceVessel}>
                    {upcomingMaintenance.vesselName}
                  </Text>
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
                <LinearGradient
                  colors={
                    upcomingMaintenance.priority === "high" ||
                    upcomingMaintenance.priority === "urgent"
                      ? [colors.danger + "40", colors.danger + "20"]
                      : upcomingMaintenance.priority === "medium"
                        ? [colors.warning + "40", colors.warning + "20"]
                        : [colors.success + "40", colors.success + "20"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.priorityBadge}
                >
                  <Text style={styles.priorityText}>
                    {upcomingMaintenance.priority.toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>
            </PressableCard>
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
              <PressableCard key={approval.id} style={styles.approvalCard}>
                <View style={styles.approvalHeader}>
                  <View style={styles.approvalLeft}>
                    <Text style={styles.approvalItem}>{approval.itemName}</Text>
                    <Text style={styles.approvalVessel}>
                      {approval.vesselName}
                    </Text>
                  </View>
                  <Text style={styles.approvalAmount}>
                    ${approval.estimatedCost}
                  </Text>
                </View>
                <View style={styles.approvalFooter}>
                  <LinearGradient
                    colors={[colors.accent + "30", colors.accent + "10"]}
                    style={styles.approvalCategory}
                  >
                    <Text style={styles.approvalCategoryText}>
                      {approval.category}
                    </Text>
                  </LinearGradient>
                  <Text style={styles.approvalQuantity}>
                    {approval.quantity} {approval.unit}
                  </Text>
                </View>
              </PressableCard>
            ))}
            <GradientButton
              title="Review All Requests"
              onPress={handleApproveRequests}
              icon="checkmark.circle.fill"
              androidIcon="check_circle"
              style={styles.viewAllButton}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {myActivityLogs.length > 0 ? (
            myActivityLogs.map((log, index) => (
              <PressableCard key={log.id} style={styles.activityCard}>
                <LinearGradient
                  colors={
                    log.type === "maintenance" || log.type === "task"
                      ? [colors.success + "30", colors.success + "10"]
                      : log.type === "issue"
                        ? [colors.danger + "30", colors.danger + "10"]
                        : [colors.accent + "30", colors.accent + "10"]
                  }
                  style={styles.activityIcon}
                >
                  <IconSymbol
                    ios_icon_name={
                      log.type === "maintenance" || log.type === "task"
                        ? "checkmark.circle.fill"
                        : log.type === "issue"
                          ? "exclamationmark.triangle.fill"
                          : "info.circle.fill"
                    }
                    android_material_icon_name={
                      log.type === "maintenance" || log.type === "task"
                        ? "check-circle"
                        : log.type === "issue"
                          ? "warning"
                          : "info"
                    }
                    size={20}
                    color={
                      log.type === "maintenance" || log.type === "task"
                        ? colors.success
                        : log.type === "issue"
                          ? colors.danger
                          : colors.accent
                    }
                  />
                </LinearGradient>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{log.title}</Text>
                  <Text style={styles.activityDescription}>
                    {log.description}
                  </Text>
                  <Text style={styles.activityTime}>
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                </View>
              </PressableCard>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity</Text>
          )}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: "500",
  },
  roleTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    alignSelf: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.gold + "30",

    elevation: 4,
  },
  roleText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  fleetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  vesselCard: {
    flex: 1,
  },
  vesselHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  vesselIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",

    elevation: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,

    elevation: 2,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  statusDotMaintenance: {
    backgroundColor: colors.warning,
  },
  vesselName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  vesselLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  vesselFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vesselStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vesselStatText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: colors.success + "30",
  },
  statusMaintenance: {
    backgroundColor: colors.warning + "30",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  performanceCard: {
    marginBottom: 12,
  },
  performanceContent: {
    flexDirection: "row",
  },
  performanceLeft: {
    marginRight: 20,
    justifyContent: "center",
  },
  performanceRight: {
    flex: 1,
    justifyContent: "center",
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  performanceSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  expenseChartCard: {
    borderRadius: 16,
    overflow: "hidden",

    elevation: 5,
  },
  expenseChartGradient: {
    padding: 20,
  },
  expenseChartHeader: {
    marginBottom: 16,
  },
  expenseChartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  expenseChartSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  maintenanceCard: {
    padding: 16,
  },
  maintenanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  maintenanceVessel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  maintenanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  maintenanceDue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  maintenanceDueText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.5,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warning,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  approvalCard: {
    padding: 16,
    marginBottom: 12,
  },
  approvalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  approvalLeft: {
    flex: 1,
    marginRight: 12,
  },
  approvalItem: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  approvalVessel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  approvalAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  approvalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  approvalCategory: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  approvalCategoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
  },
  approvalQuantity: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  viewAllButton: {
    marginTop: 8,
  },
  activityCard: {
    flexDirection: "row",
    padding: 16,
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 24,
  },
});
