import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../../../styles/commonStyles";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ListItemCard } from "../../../components/ListItemCard";
import { GroupedListContainer } from "../../../components/GroupedListContainer";
import { VesselCard } from "../../../components/VesselCard";
import { VesselAnalyticsSection } from "../../../components/VesselAnalyticsSection";
import GlobalSearch from "../../../components/GlobalSearch";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import {
  getPriorityBadgeColors,
  formatDueDate,
  formatDate,
} from "../../../utils/formatting";
import type { TaskPriority } from "../../../types";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { scrollProps } from "../../../hooks/useTopPadding";

export default function OwnerDashboard() {
  const insets = useSafeAreaInsets();
  const { userName, userId, userRole } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const {
    getVesselsForUser,
    getMaintenanceTasksForUser,
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

  const upcomingMaintenance = useMemo(() => {
    return myMaintenanceTasks
      .filter((task) => task.status !== "completed")
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      )[0];
  }, [myMaintenanceTasks]);


  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "maintenance":
      case "task":
        return { iosName: "wrench.and.screwdriver.fill", androidName: "build" };
      case "issue":
        return {
          iosName: "exclamationmark.triangle.fill",
          androidName: "report-problem",
        };
      case "supply":
        return { iosName: "shippingbox", androidName: "inventory-2" };
      default:
        return { iosName: "doc.text.fill", androidName: "description" };
    }
  };

  const getActivityPriorityBadge = (log: {
    type: string;
    relatedId?: string;
  }) => {
    let priority: TaskPriority | undefined;

    if (log.relatedId) {
      if (log.type === "issue") {
        const issue = myIssues.find((i) => i.id === log.relatedId);
        priority = issue?.priority;
      } else if (log.type === "maintenance" || log.type === "task") {
        const task = myMaintenanceTasks.find((t) => t.id === log.relatedId);
        priority = task?.priority;
      } else if (log.type === "supply") {
        const req = mySupplyRequests.find((r) => r.id === log.relatedId);
        priority = req?.priority;
      }
    }

    if (!priority) return undefined;

    const badge = getPriorityBadgeColors(priority);
    return {
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
      fg: badge.fg,
      bg: badge.bg,
    };
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `Hello, ${userName?.split(" ")[0] || ""}`,
          headerLargeTitleEnabled: true,
          headerLargeTitleStyle: {
            fontSize: 28,
            fontWeight: "600",
            color: colors.text,
          },
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                  gap: 10,
                marginLeft: 8,
                marginRight: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
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
        style={[styles.scrollView, { backgroundColor: colors.surfaceOne }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        {pendingApprovals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Approvals</Text>
              <Text style={styles.sectionCount}>
                {pendingApprovals.length}{" "}
                {pendingApprovals.length === 1 ? "item" : "items"}
              </Text>
            </View>
            <GroupedListContainer>
              {pendingApprovals.slice(0, 2).map((approval, index) => {
                const sliced = pendingApprovals.slice(0, 2);
                return (
                  <ListItemCard
                    key={approval.id}
                    title={`${approval.itemName} - $${approval.estimatedCost}`}
                    description={`${approval.quantity} ${approval.unit}`}
                    vesselName={approval.vesselName}
                    onPress={() =>
                      router.push({
                        pathname: "/detail-supply",
                        params: { id: approval.id },
                      })
                    }
                    isFirst={index === 0}
                    isLast={index === sliced.length - 1}
                    icon={{
                      iosName: "shippingbox",
                      androidName: "inventory-2",
                    }}
                    badge={{
                      label:
                        approval.priority.charAt(0).toUpperCase() +
                        approval.priority.slice(1),
                      fg: getPriorityBadgeColors(approval.priority).fg,
                      bg: getPriorityBadgeColors(approval.priority).bg,
                    }}
                    metaText={formatDate(new Date(approval.createdAt))}
                    inContainer={true}
                    style={{ marginLeft: 0, backgroundColor: "transparent" }}
                  />
                );
              })}
            </GroupedListContainer>
          </View>
        )}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.sectionCount}>
              {myActivityLogs.length}{" "}
              {myActivityLogs.length === 1 ? "item" : "items"}
            </Text>
          </View>
          {myActivityLogs.length > 0 ? (
            <GroupedListContainer>
              {myActivityLogs.map((log, index) => (
                <ListItemCard
                  key={log.id}
                  title={log.title}
                  description={log.description}
                  vesselName={log.vesselName || ""}
                  onPress={() => {
                    switch (log.type) {
                      case "maintenance":
                      case "task":
                        router.push({
                          pathname: "/detail-maintenance",
                          params: { id: log.relatedId },
                        });
                        break;
                      case "issue":
                        router.push({
                          pathname: "/detail-issue",
                          params: { id: log.relatedId },
                        });
                        break;
                      case "supply":
                        router.push({
                          pathname: "/detail-supply",
                          params: { id: log.relatedId },
                        });
                        break;
                    }
                  }}
                  isFirst={index === 0}
                  isLast={index === myActivityLogs.length - 1}
                  icon={getActivityTypeIcon(log.type)}
                  badge={getActivityPriorityBadge(log)}
                  metaText={formatDate(new Date(log.timestamp))}
inContainer={true}
                  style={{ marginLeft: 0, backgroundColor: "transparent" }}
                />
              ))}
            </GroupedListContainer>
          ) : (
            <Text style={styles.emptyText}>No recent activity</Text>
          )}
        </View>
        <View style={[styles.section, {marginBottom: 4}]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fleet Overview</Text>
            <Text style={styles.sectionCount}>
              {myVessels.length} {myVessels.length === 1 ? "item" : "items"}
            </Text>
          </View>
          {myVessels.map((vessel) => (
            <VesselCard
              key={vessel.id}
              vessel={vessel}
              onPress={() =>
                router.push({
                  pathname: "/detail-vessel",
                  params: { id: vessel.id },
                })
              }
            />
          ))}
        </View>

        <VesselAnalyticsSection />

        {upcomingMaintenance && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Next Maintenance</Text>
            </View>
            <GroupedListContainer>
              {(() => {
                const priorityBadge = getPriorityBadgeColors(
                  upcomingMaintenance.priority,
                );
                return (
                  <ListItemCard
                    title={upcomingMaintenance.title}
                    description={upcomingMaintenance.vesselName}
                    vesselName={upcomingMaintenance.vesselName}
                    onPress={() =>
                      router.push({
                        pathname: "/detail-maintenance",
                        params: { id: upcomingMaintenance.id },
                      })
                    }
                    isFirst
                    isLast
                    icon={{
                      iosName: "wrench.and.screwdriver.fill",
                      androidName: "build",
                    }}
                    badge={{
                      label:
                        upcomingMaintenance.priority.charAt(0).toUpperCase() +
                        upcomingMaintenance.priority.slice(1),
                      fg: priorityBadge.fg,
                      bg: priorityBadge.bg,
                    }}
                    metaText={formatDueDate(upcomingMaintenance.dueDate)}
                    inContainer={true}
                  />
                );
              })()}
            </GroupedListContainer>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
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
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
});
