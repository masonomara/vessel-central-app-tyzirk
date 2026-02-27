import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ItemCard } from "../../../components/ItemCard";
import { PressableCard } from "../../../components/PressableCard";
import { colors, commonStyles } from "../../../styles/commonStyles";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ProgressRing } from "../../../components/ProgressRing";
import GlobalSearch from "../../../components/GlobalSearch";
import { RealtimeFeed } from "../../../components/RealtimeFeed";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { getPriorityBadgeColors } from "../../../utils/colorUtils";
import { formatDueDate } from "../../../utils/dateUtils";
import { Stack, router } from "expo-router";
import { scrollProps } from "../../../hooks/useTopPadding";

export default function ManagerDashboard() {
  const { userName, userId, userRole } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const {
    getVesselsForUser,
    getMaintenanceTasksForUser,
    getSupplyRequestsForUser,
    getIssuesForUser,
    approveSupplyRequest,
    denySupplyRequest,
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
      )
      .slice(0, 3);
  }, [myMaintenanceTasks]);

  const handleApprove = (id: string) => {
    if (!userId || !userName) {
      return;
    }
    approveSupplyRequest(id, userId, userName);
  };

  const handleReject = (id: string) => {
    denySupplyRequest(id, "Request not approved at this time");
  };

  const handleViewAllRequests = () => {
    router.push("/(tabs)/supplies");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen
        options={{
          title: "Manager Dashboard",
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <TouchableOpacity onPress={() => setShowSearch(true)}>
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

            {pendingApprovals.slice(0, 3).map((approval, index) => {
              const sliced = pendingApprovals.slice(0, 3);
              return (
                <ItemCard
                  key={approval.id}
                  title={`${approval.itemName} - $${approval.estimatedCost}`}
                  description={approval.description}
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
                  actions={
                    <View style={styles.approvalActions}>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleApprove(approval.id)}
                      >
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check-circle"
                          size={20}
                          color={colors.success}
                        />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleReject(approval.id)}
                      >
                        <IconSymbol
                          ios_icon_name="xmark.circle.fill"
                          android_material_icon_name="cancel"
                          size={20}
                          color={colors.danger}
                        />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  }
                />
              );
            })}
            {pendingApprovals.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={handleViewAllRequests}
              >
                <Text style={styles.viewAllButtonText}>
                  View All {pendingApprovals.length} Requests
                </Text>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.accent}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.section}>
          <RealtimeFeed
            userId={userId}
            limit={5}
            onItemPress={(type, id) => {
              switch (type) {
                case "issue":
                  router.push({ pathname: "/issue-detail", params: { id } });
                  break;
                case "maintenance":
                  router.push({
                    pathname: "/maintenance-detail",
                    params: { id },
                  });
                  break;
                case "supply":
                  router.push({ pathname: "/supply-detail", params: { id } });
                  break;
              }
            }}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fleet Status</Text>
            <Text style={styles.sectionCount}>
              {myVessels.length} {myVessels.length === 1 ? "item" : "items"}
            </Text>
          </View>
          {myVessels.map((vessel, index) => {
            const vesselTasks = myMaintenanceTasks.filter(
              (t) => t.vesselId === vessel.id && t.status !== "completed",
            );
            const vesselIssues = myIssues.filter(
              (i) => i.vesselId === vessel.id && i.status !== "completed",
            );
            const vesselCompletion =
              myMaintenanceTasks.filter((t) => t.vesselId === vessel.id)
                .length > 0
                ? (myMaintenanceTasks.filter(
                    (t) => t.vesselId === vessel.id && t.status === "completed",
                  ).length /
                    myMaintenanceTasks.filter((t) => t.vesselId === vessel.id)
                      .length) *
                  100
                : 0;

            return (
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
                  <View style={styles.vesselLeft}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: colors.accent + "20" },
                      ]}
                    >
                      <IconSymbol
                        ios_icon_name="sailboat.fill"
                        android_material_icon_name="sailing"
                        size={24}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.vesselInfo}>
                      <Text style={styles.vesselName}>{vessel.name}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          vessel.status === "active"
                            ? styles.statusActive
                            : styles.statusMaintenance,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            vessel.status === "active"
                              ? styles.statusTextActive
                              : styles.statusTextMaintenance,
                          ]}
                        >
                          {vessel.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <ProgressRing
                    progress={vesselCompletion}
                    size={60}
                    strokeWidth={6}
                    color={colors.success}
                    showPercentage={false}
                  />
                </View>
                <View style={styles.vesselStats}>
                  <View style={styles.statItem}>
                    <IconSymbol
                      ios_icon_name="person.2.fill"
                      android_material_icon_name="groups"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.statText}>{vessel.crewCount} Crew</Text>
                  </View>
                  <View style={styles.statItem}>
                    <IconSymbol
                      ios_icon_name="list.bullet"
                      android_material_icon_name="list"
                      size={16}
                      color={colors.warning}
                    />
                    <Text style={styles.statText}>
                      {vesselTasks.length} Tasks
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <IconSymbol
                      ios_icon_name="exclamationmark.triangle"
                      android_material_icon_name="warning"
                      size={16}
                      color={colors.danger}
                    />
                    <Text style={styles.statText}>
                      {vesselIssues.length} Issues
                    </Text>
                  </View>
                </View>
              </PressableCard>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Maintenance</Text>
            <Text style={styles.sectionCount}>
              {upcomingMaintenance.length} {upcomingMaintenance.length === 1 ? "item" : "items"}
            </Text>
          </View>
          {upcomingMaintenance.length > 0 ? (
            upcomingMaintenance.map((item, index) => {
              const priorityBadge = getPriorityBadgeColors(item.priority);
              return (
                <ItemCard
                  key={item.id}
                  title={item.title}
                  description={item.vesselName}
                  vesselName={item.vesselName}
                  onPress={() =>
                    router.push({
                      pathname: "/maintenance-detail",
                      params: { id: item.id },
                    })
                  }
                  isFirst={index === 0}
                  isLast={index === upcomingMaintenance.length - 1}
                  badge={{
                    label: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
                    fg: priorityBadge.fg,
                    bg: priorityBadge.bg,
                  }}
                  metaText={formatDueDate(item.dueDate)}
                />
              );
            })
          ) : (
            <Text style={styles.emptyText}>No upcoming maintenance</Text>
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
  // Fleet Status vessel card styles (kept — too specialized for ItemCard)
  vesselCard: {
    backgroundColor: colors.surfaceOne,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vesselHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  vesselLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  vesselInfo: {
    flex: 1,
  },
  vesselName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusActive: {
    backgroundColor: colors.success + "30",
  },
  statusMaintenance: {
    backgroundColor: colors.warning + "30",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextMaintenance: {
    color: colors.warning,
  },
  vesselStats: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  // Approval action buttons
  approvalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.success + "30",
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  approveButtonText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "600",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger + "30",
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  rejectButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
});
