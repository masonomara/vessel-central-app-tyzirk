import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { MaintenanceTask, TaskStatus, TaskPriority } from "../../../types";
import { formatDueDate, isOverdue } from "../../../utils/dateUtils";
import { Stack, router } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { useTopPadding } from "../../../hooks/useTopPadding";

const MaintenanceTaskItem = React.memo(
  ({
    task,
    onPress,
    onComplete,
  }: {
    task: MaintenanceTask;
    onPress: (task: MaintenanceTask) => void;
    onComplete: (id: string) => void;
  }) => {
    const getPriorityColor = (priority: TaskPriority) => {
      switch (priority) {
        case "urgent":
          return colors.danger;
        case "high":
          return colors.warning;
        case "medium":
          return colors.accent;
        case "low":
          return colors.success;
        default:
          return colors.grey;
      }
    };

    const getStatusColor = (status: TaskStatus) => {
      switch (status) {
        case "completed":
          return colors.success;
        case "in_progress":
          return colors.accent;
        case "waiting_on_parts":
          return colors.grey;
        case "open":
          return colors.grey;
        default:
          return colors.grey;
      }
    };

    const handlePress = useCallback(() => {
      onPress(task);
    }, [task, onPress]);

    const handleComplete = useCallback(() => {
      onComplete(task.id);
    }, [task.id, onComplete]);

    const isCompleted = task.status === "completed";

    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          isOverdue(task.dueDate) &&
            task.status !== "completed" &&
            styles.taskCardOverdue,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.taskCardRow}>
          <Pressable
            style={[
              styles.completeButton,
              { backgroundColor: isCompleted ? "blue" : "blue" },
            ]}
            onPress={handleComplete}
            hitSlop={8}
          >
            <IconSymbol
              ios_icon_name={isCompleted ? "checkmark.circle.fill" : "circle"}
              android_material_icon_name={
                isCompleted ? "check-circle" : "radio-button-unchecked"
              }
              size={16}
              color={isCompleted ? colors.success : colors.textTertiary}
            />
          </Pressable>
          <View style={styles.taskContent}>
            <View style={styles.taskHeader}>
              <View style={styles.taskTitleRow}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.isRecurring && (
                  <IconSymbol
                    ios_icon_name="arrow.clockwise"
                    android_material_icon_name="repeat"
                    size={16}
                    color={colors.accent}
                  />
                )}
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(task.priority) + "30" },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    { color: getPriorityColor(task.priority) },
                  ]}
                >
                  {task.priority.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Text>

            <View style={styles.taskMeta}>
              <View style={styles.metaItem}>
                <IconSymbol
                  ios_icon_name="sailboat.fill"
                  android_material_icon_name="sailing"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.metaText}>{task.vesselName}</Text>
              </View>
              {task.assignedToName && (
                <View style={styles.metaItem}>
                  <IconSymbol
                    ios_icon_name="person.fill"
                    android_material_icon_name="person"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.metaText}>{task.assignedToName}</Text>
                </View>
              )}
            </View>

            <View style={styles.taskFooter}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(task.status) + "30" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(task.status) },
                  ]}
                >
                  {task.status.replace("_", " ").toUpperCase()}
                </Text>
              </View>
              <View style={styles.dueDateContainer}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="event"
                  size={16}
                  color={
                    isOverdue(task.dueDate) && task.status !== "completed"
                      ? colors.danger
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.dueDateText,
                    isOverdue(task.dueDate) &&
                      task.status !== "completed" &&
                      styles.dueDateOverdue,
                  ]}
                >
                  {formatDueDate(task.dueDate)}
                </Text>
              </View>
            </View>

            {task.estimatedCost && (
              <View style={styles.costContainer}>
                <Text style={styles.costLabel}>Est. Cost:</Text>
                <Text style={styles.costValue}>
                  ${task.estimatedCost.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

export default function MaintenanceScreen() {
  const topPadding = useTopPadding();
  const { maintenanceTasks, updateMaintenanceTask } = useData();
  const { userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const vesselNames = useMemo(() => {
    const names = new Set<string>();
    maintenanceTasks.forEach((task) => {
      if (task.vesselName) names.add(task.vesselName);
    });
    return Array.from(names).sort();
  }, [maintenanceTasks]);

  const toggleSection = useCallback((title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }, []);

  const sections = useMemo(() => {
    const filtered = maintenanceTasks.filter((task) => {
      const matchesVessel =
        filterVessel === "all" || task.vesselName === filterVessel;
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesVessel && matchesSearch;
    });

    const open = filtered.filter((t) => t.status === "open");
    const inProgress = filtered.filter((t) => t.status === "in_progress");
    const waitingOnParts = filtered.filter(
      (t) => t.status === "waiting_on_parts",
    );
    const completed = filtered.filter((t) => t.status === "completed");

    const sectionDefs: { title: string; items: MaintenanceTask[] }[] = [
      { title: "Open", items: open },
      { title: "In Progress", items: inProgress },
      { title: "Waiting on Parts", items: waitingOnParts },
      { title: "Completed", items: completed },
    ];

    return sectionDefs
      .filter((s) => s.items.length > 0)
      .map((s) => ({
        title: s.title,
        count: s.items.length,
        data: collapsedSections.has(s.title) ? [] : s.items,
      }));
  }, [maintenanceTasks, filterVessel, searchQuery, collapsedSections]);

  const stats = useMemo(() => {
    const filtered = maintenanceTasks.filter((task) => {
      const matchesVessel =
        filterVessel === "all" || task.vesselName === filterVessel;
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesVessel && matchesSearch;
    });
    return {
      total: filtered.length,
      overdue: filtered.filter(
        (t) => isOverdue(t.dueDate) && t.status !== "completed",
      ).length,
      completed: filtered.filter((t) => t.status === "completed").length,
    };
  }, [maintenanceTasks, filterVessel, searchQuery]);

  const handleTaskPress = useCallback((task: MaintenanceTask) => {
    router.push(`/maintenance-detail?id=${task.id}`);
  }, []);

  const handleComplete = useCallback(
    (id: string) => {
      updateMaintenanceTask(id, { status: "completed" });
    },
    [updateMaintenanceTask],
  );

  const renderItem = useCallback(
    ({ item }: { item: MaintenanceTask }) => (
      <MaintenanceTaskItem
        task={item}
        onPress={handleTaskPress}
        onComplete={handleComplete}
      />
    ),
    [handleTaskPress, handleComplete],
  );

  const keyExtractor = useCallback((item: MaintenanceTask) => item.id, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; count: number } }) => {
      const collapsed = collapsedSections.has(section.title);
      return (
        <Pressable
          style={indexScreenStyles.sectionHeaderRow}
          onPress={() => toggleSection(section.title)}
        >
          <IconSymbol
            ios_icon_name={collapsed ? "chevron.right" : "chevron.down"}
            android_material_icon_name={
              collapsed ? "chevron-right" : "expand-more"
            }
            size={24}
            color={colors.textSecondary}
            style={indexScreenStyles.dropdown}
          />
          <Text style={indexScreenStyles.sectionHeader}>{section.title}</Text>
        </Pressable>
      );
    },
    [collapsedSections, toggleSection],
  );

  const ListHeaderComponent = useCallback(
    () => (
      <>
        <View style={styles.searchContainer}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={indexScreenStyles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={["all", ...vesselNames]}
            renderItem={({ item: vessel }) => (
              <TouchableOpacity
                style={[
                  indexScreenStyles.filterChip,
                  filterVessel === vessel && indexScreenStyles.filterChipActive,
                ]}
                onPress={() => setFilterVessel(vessel)}
              >
                <Text
                  style={[
                    indexScreenStyles.filterChipText,
                    filterVessel === vessel &&
                      indexScreenStyles.filterChipTextActive,
                  ]}
                >
                  {vessel === "all" ? "All" : vessel}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            contentContainerStyle={indexScreenStyles.filterContent}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {stats.overdue}
            </Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {stats.completed}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </>
    ),
    [searchQuery, filterVessel, vesselNames, stats],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyState}>
        <IconSymbol
          ios_icon_name="wrench.and.screwdriver"
          android_material_icon_name="build"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyStateText}>No maintenance tasks found</Text>
        {(userRole === "manager" || userRole === "owner") && (
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => router.push("/add-maintenance-task")}
          >
            <Text style={styles.emptyStateButtonText}>Create First Task</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [userRole],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen
        options={{
          title: "Maintenance",
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              {(userRole === "manager" || userRole === "owner") && (
                <TouchableOpacity
                  onPress={() => router.push("/add-maintenance-task")}
                >
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              )}
              <ProfileHeaderButton />
            </View>
          ),
        }}
      />

      <SectionList
        sections={sections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={[styles.listContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  taskCard: {
    backgroundColor: colors.surfaceOne,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  completeButton: {
    paddingTop: 2,
    paddingRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskCardOverdue: {},
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dueDateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  dueDateOverdue: {
    color: colors.danger,
    fontWeight: "600",
  },
  costContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  costLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 8,
  },
  costValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent,
  },
});
