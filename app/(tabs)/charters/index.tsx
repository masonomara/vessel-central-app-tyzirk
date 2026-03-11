import React, { useState, useMemo, useCallback } from "react";
import { View, Text, SectionList, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { scrollProps } from "../../../hooks/useTopPadding";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ListItemCard } from "../../../components/ListItemCard";
import { CharterLog, CharterStatus } from "../../../types";
import { formatDate } from "../../../utils/formatting";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "../../../components/SearchBar";
import { FilterRow } from "../../../components/FilterRow";
import { CollapsibleSectionHeader } from "../../../components/CollapsibleSectionHeader";

function getStatusBadgeColors(status: CharterStatus): { fg: string; bg: string } {
  switch (status) {
    case "upcoming":
      return { fg: colors.blueForeground, bg: colors.blueBackground };
    case "in_progress":
      return { fg: colors.orangeForeground, bg: colors.orangeBackground };
    case "completed":
      return { fg: colors.greenForeground, bg: colors.greenBackground };
    case "cancelled":
      return { fg: colors.redForeground, bg: colors.redBackground };
    default:
      return { fg: colors.textSecondary, bg: colors.surfaceThree };
  }
}

export default function ChartersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { charterLogs, getCharterLogsForUser } = useData();
  const { userRole, userId } = useAuth();
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const userCharters = useMemo(
    () => getCharterLogsForUser(userId, userRole || "crew"),
    [charterLogs, userId, userRole],
  );

  const vesselNames = useMemo(() => {
    const names = new Set<string>();
    userCharters.forEach((c) => {
      if (c.vesselName) names.add(c.vesselName);
    });
    return Array.from(names).sort();
  }, [userCharters]);

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
    const filtered = userCharters.filter((charter) => {
      const matchesVessel =
        filterVessel === "all" || charter.vesselName === filterVessel;
      const matchesSearch =
        charter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        charter.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        charter.itinerary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesVessel && matchesSearch;
    });

    const upcoming = filtered.filter((c) => c.status === "upcoming");
    const inProgress = filtered.filter((c) => c.status === "in_progress");
    const completed = filtered.filter((c) => c.status === "completed");
    const cancelled = filtered.filter((c) => c.status === "cancelled");

    const sectionDefs: { title: string; items: CharterLog[] }[] = [
      { title: "Upcoming", items: upcoming },
      { title: "In Progress", items: inProgress },
      { title: "Completed", items: completed },
      { title: "Cancelled", items: cancelled },
    ];

    return sectionDefs
      .filter((s) => s.items.length > 0)
      .map((s) => ({
        title: s.title,
        count: s.items.length,
        data: collapsedSections.has(s.title) ? [] : s.items,
      }));
  }, [userCharters, filterVessel, searchQuery, collapsedSections]);

  const handleCharterPress = useCallback(
    (charter: CharterLog) => {
      router.push({ pathname: "/charter-detail", params: { id: charter.id } });
    },
    [router],
  );

  const formatStatusLabel = (status: CharterStatus): string => {
    return status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: CharterLog;
      index: number;
      section: { data: CharterLog[] };
    }) => (
      <ListItemCard
        title={item.title}
        description={
          formatDate(item.startDate) + " \u2014 " + formatDate(item.endDate)
        }
        vesselName={item.vesselName}
        onPress={() => handleCharterPress(item)}
        isFirst={index === 0}
        isLast={index === section.data.length - 1}
        badge={{
          label: formatStatusLabel(item.status),
          fg: getStatusBadgeColors(item.status).fg,
          bg: getStatusBadgeColors(item.status).bg,
        }}
        metaText={"$" + item.revenue.toLocaleString()}
      />
    ),
    [handleCharterPress],
  );

  const keyExtractor = useCallback((item: CharterLog) => item.id, []);

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
          placeholder="Search charters..."
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
          ios_icon_name="sailboat"
          android_material_icon_name="directions-boat"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={indexScreenStyles.emptyStateText}>No charters found</Text>
      </View>
    ),
    [],
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
          title: "Charters",
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <TouchableOpacity onPress={() => router.push("/add-charter")}>
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
              height: insets.bottom + 64,
            }}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={indexScreenStyles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        {...scrollProps}
      />
    </View>
  );
}
