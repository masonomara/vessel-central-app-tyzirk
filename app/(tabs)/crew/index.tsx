import { useMemo } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { ListItemCard } from "../../../components/ListItemCard";
import { GroupedListContainer } from "../../../components/GroupedListContainer";
import { VesselCard } from "../../../components/VesselCard";
import { colors } from "../../../styles/commonStyles";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import {
  getPriorityBadgeColors,
  formatDueDate,
  formatDate,
} from "../../../utils/formatting";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { scrollProps } from "../../../hooks/useTopPadding";

export default function CrewDashboard() {
  const insets = useSafeAreaInsets();
  const { userName, userId, userRole } = useAuth();
  const {
    getVesselsForUser,
    getMaintenanceTasksForUser,
    getSupplyRequestsForUser,
    updateMaintenanceTask,
  } = useData();

  const myVessels = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getVesselsForUser(userId, userRole);
  }, [userId, userRole, getVesselsForUser]);

  const myTasks = useMemo(() => {
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

  const toggleTaskCompletion = (taskId: string) => {
    const task = myTasks.find((t) => t.id === taskId);
    if (task) {
      const newStatus = task.status === "completed" ? "open" : "completed";
      updateMaintenanceTask(taskId, { status: newStatus });
    }
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
                gap: 8,
                marginLeft: 4,
                marginRight: 4,
              }}
            >
              <ProfileHeaderButton />
            </View>
          ),
        }}
      />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.surfaceOne }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Tasks</Text>
            <Text style={styles.sectionCount}>
              {myTasks.length} {myTasks.length === 1 ? "item" : "items"}
            </Text>
          </View>

          {myTasks.length > 0 ? (
            <GroupedListContainer>
              {myTasks.map((task, index) => {
                const priorityBadge = getPriorityBadgeColors(task.priority);
                return (
                  <ListItemCard
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    vesselName={task.vesselName}
                    onPress={() =>
                      router.push({
                        pathname: "/detail-maintenance",
                        params: { id: task.id },
                      })
                    }
                    isFirst={index === 0}
                    isLast={index === myTasks.length - 1}
                    showCheckbox
                    isCompleted={task.status === "completed"}
                    onComplete={() => toggleTaskCompletion(task.id)}
                    badge={{
                      label:
                        task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1),
                      fg: priorityBadge.fg,
                      bg: priorityBadge.bg,
                    }}
                    metaText={
                      task.status === "completed"
                        ? "Completed"
                        : formatDueDate(task.dueDate)
                    }
                    inContainer={true}
                    style={{ marginLeft: 0, backgroundColor: "transparent" }}
                  />
                );
              })}
            </GroupedListContainer>
          ) : (
            <Text style={styles.emptyText}>No tasks assigned</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Supply Requests</Text>
            <Text style={styles.sectionCount}>
              {mySupplyRequests.length}{" "}
              {mySupplyRequests.length === 1 ? "item" : "items"}
            </Text>
          </View>
          {mySupplyRequests.length > 0 ? (
            <GroupedListContainer>
              {mySupplyRequests.map((request, index) => (
                <ListItemCard
                  key={request.id}
                  title={`${request.itemName} - $${request.estimatedCost}`}
                  description={`${request.quantity} ${request.unit}`}
                  vesselName={request.vesselName}
                  onPress={() =>
                    router.push({
                      pathname: "/detail-supply",
                      params: { id: request.id },
                    })
                  }
                  isFirst={index === 0}
                  isLast={index === mySupplyRequests.length - 1}
                  icon={{ iosName: "shippingbox", androidName: "inventory-2" }}
                  badge={{
                    label:
                      request.priority.charAt(0).toUpperCase() +
                      request.priority.slice(1),
                    fg: getPriorityBadgeColors(request.priority).fg,
                    bg: getPriorityBadgeColors(request.priority).bg,
                  }}
                  metaText={formatDate(request.createdAt)}
                  inContainer={true}
                  style={{ marginLeft: 0, backgroundColor: "transparent" }}
                />
              ))}
            </GroupedListContainer>
          ) : (
            <Text style={styles.emptyText}>No supply requests</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Vessels</Text>
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
    marginBottom: 20,
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
