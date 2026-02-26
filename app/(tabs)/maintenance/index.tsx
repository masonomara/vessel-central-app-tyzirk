import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View, Text, SectionList, TouchableOpacity } from "react-native";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ItemCard } from "../../../components/ItemCard";
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
      <ItemCard
        title={`${item.title}${item.estimatedCost != null ? ` - $${item.estimatedCost}` : ""}`}
        description={item.description}
        vesselName={item.vesselName}
        onPress={() => handleTaskPress(item)}
        isLast={index === section.data.length - 1}
        showCheckbox
        isCompleted={item.status === "completed"}
        onComplete={() => handleComplete(item.id)}
        badge={{
          label: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
          fg: getPriorityBadgeColors(item.priority).fg,
          bg: getPriorityBadgeColors(item.priority).bg,
        }}
        metaText={formatDueDate(item.dueDate)}
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
        { backgroundColor: colors.surfaceTwo },
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
