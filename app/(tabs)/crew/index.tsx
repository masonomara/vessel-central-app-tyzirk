import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { PressableCard } from "../../../components/PressableCard";
import { colors, commonStyles } from "../../../styles/commonStyles";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { Stack, router } from "expo-router";
import { scrollProps } from "../../../hooks/useTopPadding";

export default function CrewDashboard() {
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

  const pendingTasks = useMemo(() => {
    return myTasks.filter((t) => t.status !== "completed");
  }, [myTasks]);

  const completedTasks = useMemo(() => {
    return myTasks.filter((t) => t.status === "completed");
  }, [myTasks]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen
        options={{
          title: "Crew Dashboard",
          headerRight: () => <ProfileHeaderButton />,
        }}
      />
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
          <Text style={commonStyles.title}>
            Hello, {userName?.split(" ")[0]}
          </Text>
        </View>

        {/* <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingTasks.length}</Text>
            <Text style={styles.statLabel}>Pending Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View> */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Tasks</Text>
            {pendingTasks.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingTasks.length}</Text>
              </View>
            )}
          </View>

          {myTasks.length > 0 ? (
            myTasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  task.status === "completed" && styles.taskCardCompleted,
                ]}
              >
                <TouchableOpacity
                  style={styles.taskCheckbox}
                  onPress={() => toggleTaskCompletion(task.id)}
                >
                  {task.status === "completed" ? (
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={28}
                      color={colors.success}
                    />
                  ) : (
                    <IconSymbol
                      ios_icon_name="circle"
                      android_material_icon_name="radio-button-unchecked"
                      size={28}
                      color={colors.textSecondary}
                    />
                  )}
                </TouchableOpacity>
                <PressableCard
                  variant="ghost"
                  style={styles.taskContent}
                  onPress={() =>
                    router.push({
                      pathname: "/maintenance-detail",
                      params: { id: task.id },
                    })
                  }
                >
                  <View style={styles.taskHeader}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.status === "completed" &&
                          styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View
                      style={[
                        styles.priorityBadge,
                        task.priority === "high" || task.priority === "urgent"
                          ? styles.priorityHigh
                          : task.priority === "medium"
                            ? styles.priorityMedium
                            : styles.priorityLow,
                      ]}
                    >
                      <Text style={styles.priorityText}>
                        {task.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.taskDescription,
                      task.status === "completed" &&
                        styles.taskDescriptionCompleted,
                    ]}
                  >
                    {task.description}
                  </Text>
                  <Text style={styles.taskVessel}>{task.vesselName}</Text>
                  <View style={styles.taskFooter}>
                    <IconSymbol
                      ios_icon_name="clock"
                      android_material_icon_name="schedule"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.taskTime}>
                      {task.status === "completed"
                        ? "Completed"
                        : `Due: ${formatTime(task.dueDate)}`}
                    </Text>
                  </View>
                </PressableCard>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No tasks assigned</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supply Requests</Text>
          {mySupplyRequests.length > 0 ? (
            mySupplyRequests.map((request) => (
              <PressableCard
                key={request.id}
                style={styles.supplyCard}
                onPress={() =>
                  router.push({
                    pathname: "/supply-detail",
                    params: { id: request.id },
                  })
                }
              >
                <View style={styles.supplyHeader}>
                  <IconSymbol
                    ios_icon_name="shippingbox.fill"
                    android_material_icon_name="inventory-2"
                    size={24}
                    color={colors.accent}
                  />
                  <View style={styles.supplyInfo}>
                    <Text style={styles.supplyItem}>{request.itemName}</Text>
                    <Text style={styles.supplyQuantity}>
                      {request.quantity} {request.unit} - $
                      {request.estimatedCost}
                    </Text>
                    <Text style={styles.supplyVessel}>
                      {request.vesselName}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.supplyStatus,
                    request.status === "approved"
                      ? styles.supplyStatusApproved
                      : request.status === "denied"
                        ? styles.supplyStatusDenied
                        : styles.supplyStatusPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.supplyStatusText,
                      request.status === "approved"
                        ? styles.supplyStatusTextApproved
                        : request.status === "denied"
                          ? styles.supplyStatusTextDenied
                          : styles.supplyStatusTextPending,
                    ]}
                  >
                    {request.status.toUpperCase()}
                  </Text>
                </View>
              </PressableCard>
            ))
          ) : (
            <Text style={styles.emptyText}>No supply requests</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Vessels</Text>
          {myVessels.map((vessel) => (
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
              <IconSymbol
                ios_icon_name="sailboat.fill"
                android_material_icon_name="sailing"
                size={24}
                color={colors.accent}
              />
              <View style={styles.vesselInfo}>
                <Text style={styles.vesselName}>{vessel.name}</Text>
                <Text style={styles.vesselLocation}>{vessel.location}</Text>
              </View>
            </PressableCard>
          ))}
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
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    lineHeight: 21,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  roleTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceOne,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
  },
  roleText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    height: 36,
    marginBottom: 12,
    marginTop: 12,
  },
  vesselCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  vesselInfo: {
    flex: 1,
  },
  vesselName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  vesselLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "600",
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",

    gap: 12,
  },
  badge: {
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  taskCard: {
    flexDirection: "row",
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardCompleted: {
    opacity: 0.6,
    borderColor: colors.success,
  },
  taskCheckbox: {
    marginRight: 12,
    paddingTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: colors.textSecondary,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  taskDescriptionCompleted: {
    textDecorationLine: "line-through",
  },
  taskVessel: {
    fontSize: 13,
    color: colors.accent,
    marginBottom: 8,
    fontWeight: "500",
  },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  taskTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityHigh: {
    backgroundColor: colors.danger + "30",
  },
  priorityMedium: {
    backgroundColor: colors.warning + "30",
  },
  priorityLow: {
    backgroundColor: colors.success + "30",
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text,
  },
  supplyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supplyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  supplyInfo: {
    flex: 1,
  },
  supplyItem: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  supplyQuantity: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  supplyVessel: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: "500",
  },
  supplyStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  supplyStatusApproved: {
    backgroundColor: colors.success + "30",
  },
  supplyStatusPending: {
    backgroundColor: colors.warning + "30",
  },
  supplyStatusDenied: {
    backgroundColor: colors.danger + "30",
  },
  supplyStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  supplyStatusTextApproved: {
    color: colors.success,
  },
  supplyStatusTextPending: {
    color: colors.warning,
  },
  supplyStatusTextDenied: {
    color: colors.danger,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  quickActions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
