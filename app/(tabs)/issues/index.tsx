import React, { useState, useMemo, useCallback } from "react";
import { View, Text, SectionList, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { scrollProps } from "../../../hooks/useTopPadding";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ListItemCard } from "../../../components/ListItemCard";
import { Issue } from "../../../types";
import { formatDate, getPriorityBadgeColors } from "../../../utils/formatting";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "../../../components/SearchBar";
import { FilterRow } from "../../../components/FilterRow";
import { CollapsibleSectionHeader } from "../../../components/CollapsibleSectionHeader";

export default function IssuesScreen() {
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
      router.push({ pathname: "/detail-issue", params: { id: issue.id } });
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
      <ListItemCard
        title={item.title}
        description={item.description}
        vesselName={item.vesselName}
        onPress={() => handleIssuePress(item)}
        isFirst={index === 0}
        isLast={index === section.data.length - 1}
        showCheckbox
        isCompleted={item.status === "completed"}
        onComplete={() => handleComplete(item.id)}
        badge={{
          label: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
          fg: getPriorityBadgeColors(item.priority).fg,
          bg: getPriorityBadgeColors(item.priority).bg,
        }}
        metaText={formatDate(item.createdAt)}
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
    <>
      <Stack.Screen
        options={{
          title: "Issues",
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
        style={[indexScreenStyles.container, { backgroundColor: colors.surfaceOne }]}
        sections={sections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={
          <View
            style={{
              height: insets.bottom,
            }}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={indexScreenStyles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        {...scrollProps}
      />
    </>
  );
}
