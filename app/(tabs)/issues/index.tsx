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
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { useTopPadding } from "../../../hooks/useTopPadding";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { Issue, TaskPriority } from "../../../types";
import { formatDate } from "../../../utils/dateUtils";

const IssueItem = React.memo(
  ({
    issue,
    onPress,
    onComplete,
    isFirst,
  }: {
    issue: Issue;
    onPress: (issue: Issue) => void;
    onComplete: (id: string) => void;
    isFirst: boolean;
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

    const handlePress = useCallback(() => {
      onPress(issue);
    }, [issue, onPress]);

    const handleComplete = useCallback(() => {
      onComplete(issue.id);
    }, [issue.id, onComplete]);

    const isCompleted = issue.status === "completed";

    return (
      <TouchableOpacity style={[styles.issueCard]} onPress={handlePress}>
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

          <Text style={styles.issueTitle} numberOfLines={2}>
            {issue.title}
          </Text>

          {/* <Text style={styles.reportedByText}>
          {issue.vesselName} · {formatDate(issue.createdAt)}
        </Text> */}

          <Text
            style={[
              styles.priorityText,
              { color: getPriorityColor(issue.priority) },
            ]}
          >
            {issue.priority}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.issueDescription} numberOfLines={2}>
            {issue.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

export default function IssuesScreen() {
  const topPadding = useTopPadding();
  const router = useRouter();
  const { issues, updateIssue } = useData();
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const vesselNames = useMemo(() => {
    const names = new Set<string>();
    issues.forEach((issue) => {
      if (issue.vesselName) names.add(issue.vesselName);
    });
    return Array.from(names).sort();
  }, [issues]);

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
    const filtered = issues.filter((issue) => {
      const matchesVessel =
        filterVessel === "all" || issue.vesselName === filterVessel;
      const matchesSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesVessel && matchesSearch;
    });

    const open = filtered.filter((i) => i.status === "open");
    const inProgress = filtered.filter((i) => i.status === "in_progress");
    const waitingOnParts = filtered.filter(
      (i) => i.status === "waiting_on_parts",
    );
    const completed = filtered.filter((i) => i.status === "completed");

    const sectionDefs: { title: string; items: Issue[] }[] = [
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
  }, [issues, filterVessel, searchQuery, collapsedSections]);

  const handleIssuePress = useCallback(
    (issue: Issue) => {
      router.push({ pathname: "/issue-detail", params: { id: issue.id } });
    },
    [router],
  );

  const handleComplete = useCallback(
    (id: string) => {
      updateIssue(id, { status: "completed" });
    },
    [updateIssue],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Issue; index: number }) => (
      <IssueItem
        issue={item}
        onPress={handleIssuePress}
        onComplete={handleComplete}
        isFirst={index === 0}
      />
    ),
    [handleIssuePress, handleComplete],
  );

  const keyExtractor = useCallback((item: Issue) => item.id, []);

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
            color={colors.text}
            style={indexScreenStyles.dropdown}
          />
          <Text style={indexScreenStyles.sectionHeader}>{section.title}</Text>
          <Text style={indexScreenStyles.sectionCount}>
            {" "}
            {section.count} items
          </Text>
        </Pressable>
      );
    },
    [collapsedSections, toggleSection],
  );

  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.listHeaderComponent}>
        <View style={styles.searchContainer}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search issues..."
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
      </View>
    ),
    [searchQuery, filterVessel, vesselNames],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyState}>
        <IconSymbol
          ios_icon_name="checkmark.circle"
          android_material_icon_name="check-circle"
          size={64}
          color={colors.success}
        />
        <Text style={styles.emptyStateText}>No issues found</Text>
        <Text style={styles.emptyStateSubtext}>
          All systems running smoothly!
        </Text>
      </View>
    ),
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen
        options={{
          title: "Issues",
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <TouchableOpacity onPress={() => router.push("/add-issue")}>
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
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
        contentContainerStyle={[styles.listContent, { marginTop: topPadding }]}
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

    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  listContent: {
    paddingBottom: 20,

    backgroundColor: colors.surfaceTwo,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  issueCard: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.surfaceOne,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  completeButton: {
    height: 20,
    width: 20,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  issueTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    gap: 16,
  },
  issueDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 19,

    marginTop: 11,
  },
  bottomRow: {
    paddingLeft: 36,
  },
  reportedByText: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textTertiary,
  },
  priorityBadge: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
    borderRadius: 4,

    lineHeight: 24,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  listHeaderComponent: {
    backgroundColor: colors.surfaceOne,
  },
});
