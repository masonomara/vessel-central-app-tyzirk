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
import { Equipment, EquipmentCategory } from "../../../types";
import { getConditionBadgeColors } from "../../../utils/formatting";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "../../../components/SearchBar";
import { FilterRow } from "../../../components/FilterRow";
import { CollapsibleSectionHeader } from "../../../components/CollapsibleSectionHeader";


const CATEGORY_ORDER: EquipmentCategory[] = [
  "safety",
  "water_toys",
  "navigation",
  "communication",
  "anchoring",
  "tender",
  "galley",
  "other",
];

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  safety: "Safety",
  water_toys: "Water Toys",
  navigation: "Navigation",
  communication: "Communication",
  anchoring: "Anchoring",
  tender: "Tender",
  galley: "Galley",
  other: "Other",
};

function formatConditionLabel(condition: string): string {
  return condition
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function EquipmentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { equipment, getEquipmentForUser } = useData();
  const { userRole, userId } = useAuth();
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const userEquipment = useMemo(
    () => getEquipmentForUser(userId, userRole || "crew"),
    [equipment, userId, userRole],
  );

  const vesselNames = useMemo(() => {
    const names = new Set<string>();
    userEquipment.forEach((e) => {
      if (e.vesselName) names.add(e.vesselName);
    });
    return Array.from(names).sort();
  }, [userEquipment]);

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
    const filtered = userEquipment.filter((item) => {
      const matchesVessel =
        filterVessel === "all" || item.vesselName === filterVessel;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.manufacturer || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesVessel && matchesSearch;
    });

    const grouped: Record<string, Equipment[]> = {};
    filtered.forEach((item) => {
      const cat = item.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    return CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map(
      (cat) => ({
        title: CATEGORY_LABELS[cat],
        count: grouped[cat].length,
        data: collapsedSections.has(CATEGORY_LABELS[cat])
          ? []
          : grouped[cat],
      }),
    );
  }, [userEquipment, filterVessel, searchQuery, collapsedSections]);

  const handleItemPress = useCallback(
    (item: Equipment) => {
      router.push({
        pathname: "/detail-equipment",
        params: { id: item.id },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: Equipment;
      index: number;
      section: { data: Equipment[] };
    }) => (
      <ListItemCard
        title={item.name}
        description={item.description}
        vesselName={item.vesselName}
        onPress={() => handleItemPress(item)}
        isFirst={index === 0}
        isLast={index === section.data.length - 1}
        badge={{
          label: formatConditionLabel(item.condition),
          fg: getConditionBadgeColors(item.condition).fg,
          bg: getConditionBadgeColors(item.condition).bg,
        }}
        metaText={"Qty: " + item.quantity}
      />
    ),
    [handleItemPress],
  );

  const keyExtractor = useCallback((item: Equipment) => item.id, []);

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
          placeholder="Search equipment..."
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
          ios_icon_name="shippingbox"
          android_material_icon_name="inventory-2"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={indexScreenStyles.emptyStateText}>
          No equipment found
        </Text>
      </View>
    ),
    [],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Equipment",
          headerLargeTitleEnabled: true,
          headerBackTitle: "Back",
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
              <TouchableOpacity
                onPress={() => router.push("/add-equipment")}
              >
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
