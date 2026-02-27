import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { colors, commonStyles } from "../../../styles/commonStyles";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ProgressRing } from "../../../components/ProgressRing";
import { MiniChart } from "../../../components/MiniChart";
import { ItemCard } from "../../../components/ItemCard";
import { PressableCard } from "../../../components/PressableCard";
import GlobalSearch from "../../../components/GlobalSearch";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { getPriorityBadgeColors } from "../../../utils/colorUtils";
import { formatDueDate, formatDate } from "../../../utils/dateUtils";

import { Stack, router } from "expo-router";
import { scrollProps } from "../../../hooks/useTopPadding";

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

  const getActivityTypeBadge = (type: string) => {
    switch (type) {
      case "maintenance":
        return { label: "Maintenance", fg: colors.greenForeground, bg: colors.greenBackground };
      case "task":
        return { label: "Task", fg: colors.greenForeground, bg: colors.greenBackground };
      case "issue":
        return { label: "Issue", fg: colors.redForeground, bg: colors.redBackground };
      case "supply":
        return { label: "Supply", fg: colors.accent, bg: colors.accent + "30" };
      default:
        return { label: type.charAt(0).toUpperCase() + type.slice(1), fg: colors.accent, bg: colors.accent + "30" };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen
        options={{
          title: "Owner Dashboard",
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
        {...scrollProps}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text style={commonStyles.title}>Hello, {userName?.split(" ")[0]}</Text>
        </View>
        {pendingApprovals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Approvals</Text>
              <Text style={styles.sectionCount}>
                {pendingApprovals.length} {pendingApprovals.length === 1 ? "item" : "items"}
              </Text>
            </View>
            {pendingApprovals.slice(0, 2).map((approval, index) => {
              const sliced = pendingApprovals.slice(0, 2);
              return (
                <ItemCard
                  key={approval.id}
                  title={`${approval.itemName} - $${approval.estimatedCost}`}
                  description={`${approval.quantity} ${approval.unit}`}
                  vesselName={approval.vesselName}
                  onPress={() =>
                    router.push({
                      pathname: "/supply-detail",
                      params: { id: approval.id },
                    })
                  }
                  isFirst={index === 0}
                  isLast={index === sliced.length - 1}
                  badge={{
                    label: approval.category,
                    fg: colors.accent,
                    bg: colors.accent + "30",
                  }}
                  metaText={formatDate(new Date(approval.createdAt))}
                />
              );
            })}
          </View>
        )}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.sectionCount}>
              {myActivityLogs.length} {myActivityLogs.length === 1 ? "item" : "items"}
            </Text>
          </View>
          {myActivityLogs.length > 0 ? (
            myActivityLogs.map((log, index) => (
              <ItemCard
                key={log.id}
                title={log.title}
                description={log.description}
                vesselName={log.vesselName || ""}
                onPress={() => {
                  switch (log.type) {
                    case "maintenance":
                    case "task":
                      router.push({
                        pathname: "/maintenance-detail",
                        params: { id: log.relatedId },
                      });
                      break;
                    case "issue":
                      router.push({
                        pathname: "/issue-detail",
                        params: { id: log.relatedId },
                      });
                      break;
                    case "supply":
                      router.push({
                        pathname: "/supply-detail",
                        params: { id: log.relatedId },
                      });
                      break;
                  }
                }}
                isFirst={index === 0}
                isLast={index === myActivityLogs.length - 1}
                badge={getActivityTypeBadge(log.type)}
                metaText={formatDate(new Date(log.timestamp))}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity</Text>
          )}
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fleet Overview</Text>
            <Text style={styles.sectionCount}>
              {myVessels.length} {myVessels.length === 1 ? "item" : "items"}
            </Text>
          </View>
          <View style={styles.fleetGrid}>
            {myVessels.map((vessel, index) => (
              <PressableCard
                key={vessel.id}
                style={styles.vesselCard}
                onPress={() =>
                  router.push({
                    pathname: "/vessel-detail",
                    params: { id: vessel.id },
                  })
                }
              >
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance</Text>
          </View>

          <PressableCard
            style={styles.performanceCard}
            onPress={() => router.push("/analytics")}
          >
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

          <PressableCard
            style={styles.expenseChartCard}
            onPress={() => router.push("/analytics")}
          >
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Next Maintenance</Text>
            </View>
            {(() => {
              const priorityBadge = getPriorityBadgeColors(upcomingMaintenance.priority);
              return (
                <ItemCard
                  title={upcomingMaintenance.title}
                  description={upcomingMaintenance.vesselName}
                  vesselName={upcomingMaintenance.vesselName}
                  onPress={() =>
                    router.push({
                      pathname: "/maintenance-detail",
                      params: { id: upcomingMaintenance.id },
                    })
                  }
                  isFirst
                  isLast
                  badge={{
                    label: upcomingMaintenance.priority.charAt(0).toUpperCase() + upcomingMaintenance.priority.slice(1),
                    fg: priorityBadge.fg,
                    bg: priorityBadge.bg,
                  }}
                  metaText={formatDueDate(upcomingMaintenance.dueDate)}
                />
              );
            })()}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: colors.text,
  },
  sectionCount: {
    fontSize: 15,
    color: colors.textTertiary,
  },
  // Fleet Overview styles (kept — too specialized for ItemCard)
  fleetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
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
    fontWeight: "600",
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
    fontWeight: "600",
    color: colors.text,
    letterSpacing: 0.5,
  },
  // Performance styles (kept — not list items)
  performanceCard: {
    marginBottom: 12,
    marginHorizontal: 20,
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
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  performanceSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Expense chart styles (kept — not list items)
  expenseChartCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 20,
    elevation: 5,
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
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
});
