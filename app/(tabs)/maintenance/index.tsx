import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { MaintenanceTask } from "../../../types";
import { formatDueDate, isOverdue } from "../../../utils/dateUtils";
import { Stack, router } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { useTopPadding } from "../../../hooks/useTopPadding";
import { getPriorityBadgeColors } from "../../../utils/colorUtils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "../../../components/SearchBar";
import { FilterRow } from "../../../components/FilterRow";
import { CollapsibleSectionHeader } from "../../../components/CollapsibleSectionHeader";

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
      <TouchableOpacity
        style={[indexScreenStyles.card, isLast && indexScreenStyles.cardLast]}
        onPress={handlePress}
      >
        <View style={indexScreenStyles.topRow}>
          <Pressable
            style={[
              indexScreenStyles.completeButton,
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

          <Text style={indexScreenStyles.cardTitle} numberOfLines={2}>
            {task.title}
            {task.estimatedCost != null ? ` - $${task.estimatedCost}` : ""}
          </Text>
          <Text
            style={[
              indexScreenStyles.priorityText,
              { color: getPriorityBadgeColors(task.priority).fg },
              { backgroundColor: getPriorityBadgeColors(task.priority).bg },
            ]}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Text>
        </View>
        <View style={indexScreenStyles.bottomRowWithCheckbox}>
          <Text style={indexScreenStyles.cardDescription} numberOfLines={2}>
            {task.description}
          </Text>
        </View>
        <View style={indexScreenStyles.metaRowWithCheckbox}>
          <Text style={indexScreenStyles.metaText}>
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
    ({
      item,
      index,
      section,
    }: {
      item: MaintenanceTask;
      index: number;
      section: { data: MaintenanceTask[] };
    }) => (
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
    ({ section }: { section: { title: string; count: number } }) => (
      <CollapsibleSectionHeader
        title={section.title}
        count={section.count}
        collapsed={collapsedSections.has(section.title)}
        onToggle={() => toggleSection(section.title)}
      />
    ),
    [collapsedSections, toggleSection],
  );

  const ListHeaderComponent = useCallback(
    () => (
      <View style={indexScreenStyles.listHeaderComponent}>
        <SearchBar
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FilterRow
          options={["all", ...vesselNames]}
          selected={filterVessel}
          onSelect={setFilterVessel}
        />
      </View>
    ),
    [searchQuery, filterVessel, vesselNames],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={indexScreenStyles.emptyState}>
        <IconSymbol
          ios_icon_name="wrench.and.screwdriver"
          android_material_icon_name="build"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={indexScreenStyles.emptyStateText}>
          No maintenance tasks found
        </Text>
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
    <View
      style={[
        indexScreenStyles.container,
        { backgroundColor: colors.surfaceOne },
      ]}
    >
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
        ListFooterComponent={
          <View
            style={{
              backgroundColor: colors.surfaceOne,
              height: insets.bottom + 64,
            }}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={[
          indexScreenStyles.listContent,
          { marginTop: topPadding },
        ]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  emptyStateButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
