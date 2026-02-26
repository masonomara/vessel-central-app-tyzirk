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
import { getPriorityBadgeColors } from "../../../utils/colorUtils";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MaintenanceTaskItem = React.memo(
  ({
    task,
    onPress,
    onComplete,
    isLast,
  }: {
    task: MaintenanceTask;
    onPress: (task: MaintenanceTask) => void;
    onComplete: (id: string) => void;
    isLast: boolean;
  }) => {
    const handlePress = useCallback(() => {
      onPress(task);
    }, [task, onPress]);

    const handleComplete = useCallback(() => {
      onComplete(task.id);
    }, [task.id, onComplete]);

    const isCompleted = task.status === "completed";

    return (
      <TouchableOpacity style={[styles.taskCard, isLast && styles.taskCardLast]} onPress={handlePress}>
        <View style={styles.topRow}>
          <Pressable
            style={[
              styles.completeButton,
              {
                backgroundColor: isCompleted
                  ? colors.greenBackground
                  : "transparent",
              },
              {
                borderColor: isCompleted
                  ? colors.greenBackground
                  : colors.border,
              },
              { borderWidth: 1 },
            ]}
            onPress={handleComplete}
            hitSlop={8}
          >
            {isCompleted && (
              <IconSymbol
                ios_icon_name={isCompleted ? "checkmark.circle.fill" : "circle"}
                android_material_icon_name={isCompleted ? "check" : ""}
                size={16}
                color={colors.greenForeground}
              />
            )}
          </Pressable>

          <Text style={styles.taskTitle} numberOfLines={2}>
            {task.title}
          </Text>
          <Text
            style={[
              styles.priorityText,
              { color: getPriorityBadgeColors(task.priority).fg },
              { backgroundColor: getPriorityBadgeColors(task.priority).bg },
            ]}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.taskDescription} numberOfLines={2}>
            {task.description}
          </Text>
        </View>
        <View style={styles.taskMeta}>
          <Text style={styles.metaText}>
            {task.vesselName} • {formatDueDate(task.dueDate)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

export default function MaintenanceScreen() {
  const topPadding = useTopPadding();
  const insets = useSafeAreaInsets();
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
    ({ item, index, section }: { item: MaintenanceTask; index: number; section: { data: MaintenanceTask[] } }) => (
      <MaintenanceTaskItem
        task={item}
        onPress={handleTaskPress}
        onComplete={handleComplete}
        isLast={index === section.data.length - 1}
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
        contentContainerStyle={[styles.listContent, { paddingTop: topPadding, paddingBottom: insets.bottom + 64 }]}
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
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.surfaceOne,
    marginBottom: 10,
  },
  taskCardLast: {
    marginBottom: 16,
  },
  completeButton: {
    height: 20,
    width: 20,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  taskTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: colors.text,
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    gap: 16,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: 4,
  },
  bottomRow: {
    paddingLeft: 36,
  },
  priorityText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "500",
    borderRadius: 4,
    padding: 4,
    paddingVertical: 0,
    lineHeight: 20,
    height: 20,
    marginRight: 0,
    marginTop: 0,
  },
  metaText: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 15,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 36,
    gap: 8,
    marginTop: 4,
  },
});
