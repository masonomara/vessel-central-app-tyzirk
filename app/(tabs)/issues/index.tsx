import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { useTopPadding } from "../../../hooks/useTopPadding";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { Issue } from "../../../types";
import { formatDate } from "../../../utils/dateUtils";
import { getPriorityBadgeColors } from "../../../utils/colorUtils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "../../../components/SearchBar";
import { FilterRow } from "../../../components/FilterRow";
import { CollapsibleSectionHeader } from "../../../components/CollapsibleSectionHeader";

const IssueItem = React.memo(
  ({
    issue,
    onPress,
    onComplete,
    isLast,
  }: {
    issue: Issue;
    onPress: (issue: Issue) => void;
    onComplete: (id: string) => void;
    isLast: boolean;
  }) => {
    const handlePress = useCallback(() => {
      onPress(issue);
    }, [issue, onPress]);

    const handleComplete = useCallback(() => {
      onComplete(issue.id);
    }, [issue.id, onComplete]);

    const isCompleted = issue.status === "completed";

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
            {issue.title}
          </Text>
          <Text
            style={[
              indexScreenStyles.priorityText,
              { color: getPriorityBadgeColors(issue.priority).fg },
              { backgroundColor: getPriorityBadgeColors(issue.priority).bg },
            ]}
          >
            {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
          </Text>
        </View>
        <View style={indexScreenStyles.bottomRowWithCheckbox}>
          <Text style={indexScreenStyles.cardDescription} numberOfLines={2}>
            {issue.description}
          </Text>
        </View>
        <View style={indexScreenStyles.metaRowWithCheckbox}>
          <Text style={indexScreenStyles.metaText}>
            {issue.vesselName} • {formatDate(issue.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

export default function IssuesScreen() {
  const topPadding = useTopPadding();
  const insets = useSafeAreaInsets();
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
    ({
      item,
      index,
      section,
    }: {
      item: Issue;
      index: number;
      section: { data: Issue[] };
    }) => (
      <IssueItem
        issue={item}
        onPress={handleIssuePress}
        onComplete={handleComplete}
        isLast={index === section.data.length - 1}
      />
    ),
    [handleIssuePress, handleComplete],
  );

  const keyExtractor = useCallback((item: Issue) => item.id, []);

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
          placeholder="Search issues..."
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
          ios_icon_name="checkmark.circle"
          android_material_icon_name="check-circle"
          size={64}
          color={colors.success}
        />
        <Text style={indexScreenStyles.emptyStateText}>No issues found</Text>
        <Text style={indexScreenStyles.emptyStateSubtext}>
          All systems running smoothly!
        </Text>
      </View>
    ),
    [],
  );

  return (
    <View
      style={[indexScreenStyles.container, { backgroundColor: colors.surfaceOne }]}
    >
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
