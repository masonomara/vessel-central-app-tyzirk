import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ItemCard } from "../../../components/ItemCard";
import { ListWrapper } from "../../../components/ListWrapper";
import { VesselCard } from "../../../components/VesselCard";
import { colors, commonStyles } from "../../../styles/commonStyles";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";
import { IconSymbol } from "../../../components/IconSymbol";
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

            <ListWrapper>
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
                    icon={{ iosName: "shippingbox", androidName: "inventory-2" }}
                    badge={{
                      label: approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1),
                      fg: getPriorityBadgeColors(approval.priority).fg,
                      bg: getPriorityBadgeColors(approval.priority).bg,
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
                    style={{ marginLeft: 0, backgroundColor: "transparent" }}
                  />
                );
              })}
            </ListWrapper>
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
          {myVessels.map((vessel) => (
            <VesselCard
              key={vessel.id}
              vessel={vessel}
              onPress={() =>
                router.push({
                  pathname: "/vessel-detail",
                  params: { id: vessel.id },
                })
              }
            />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Maintenance</Text>
            <Text style={styles.sectionCount}>
              {upcomingMaintenance.length} {upcomingMaintenance.length === 1 ? "item" : "items"}
            </Text>
          </View>
          {upcomingMaintenance.length > 0 ? (
            <ListWrapper>
              {upcomingMaintenance.map((item, index) => {
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
                    icon={{ iosName: "wrench.and.screwdriver.fill", androidName: "build" }}
                    badge={{
                      label: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
                      fg: priorityBadge.fg,
                      bg: priorityBadge.bg,
                    }}
                    metaText={formatDueDate(item.dueDate)}
                    style={{ marginLeft: 0, backgroundColor: "transparent" }}
                  />
                );
              })}
            </ListWrapper>
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
