import React, { useState, useMemo, useCallback } from "react";
import { View, Text, SectionList, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ListItemCard } from "../../../components/ListItemCard";
import { Document } from "../../../types";
import { formatDate, formatLabel } from "../../../utils/formatting";
import { scrollProps } from "../../../hooks/useTopPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "../../../components/SearchBar";
import { FilterRow } from "../../../components/FilterRow";
import { CollapsibleSectionHeader } from "../../../components/CollapsibleSectionHeader";

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { documents } = useData();
  const { userRole } = useAuth();
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const vesselNames = useMemo(() => {
    const names = new Set<string>();
    documents.forEach((doc) => {
      if (doc.vesselName) names.add(doc.vesselName);
    });
    return Array.from(names).sort();
  }, [documents]);

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
    const filtered = documents.filter((doc) => {
      const matchesVessel =
        filterVessel === "all" || doc.vesselName === filterVessel;
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      return matchesVessel && matchesSearch;
    });

    const grouped = new Map<string, Document[]>();
    filtered.forEach((doc) => {
      const cat = doc.category;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(doc);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, items]) => ({
        title: category.charAt(0).toUpperCase() + category.slice(1),
        count: items.length,
        data: collapsedSections.has(
          category.charAt(0).toUpperCase() + category.slice(1),
        )
          ? []
          : items,
      }));
  }, [documents, filterVessel, searchQuery, collapsedSections]);

  const handleDocumentPress = useCallback(
    (doc: Document) => {
      router.push({ pathname: "/detail-document", params: { id: doc.id } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({
      item: doc,
      index,
      section,
    }: {
      item: Document;
      index: number;
      section: { data: Document[] };
    }) => (
      <ListItemCard
        title={doc.title}
        description={doc.description}
        vesselName={doc.vesselName}
        isFirst={index === 0}
        onPress={() => handleDocumentPress(doc)}
        isLast={index === section.data.length - 1}
        icon={{ iosName: "doc.text.fill", androidName: "description" }}
        badge={{
          label: formatLabel(doc.category),
          fg: colors.textSecondary,
          bg: colors.surfaceThree,
        }}
        metaText={formatDate(doc.uploadedAt)}
      />
    ),
    [handleDocumentPress],
  );

  const keyExtractor = useCallback((item: Document) => item.id, []);

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
          placeholder="Search documents..."
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
          ios_icon_name="doc.text"
          android_material_icon_name="description"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={indexScreenStyles.emptyStateText}>No documents found</Text>
      </View>
    ),
    [],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Documents",
          headerLargeTitleEnabled: true,
          headerLargeTitleStyle: {
            fontSize: 28,
            fontWeight: "600",
            color: colors.text,
          },
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              {(userRole === "manager" || userRole === "owner") && (
                <TouchableOpacity onPress={() => router.push("/add-document")}>
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
        style={[indexScreenStyles.container, { backgroundColor: colors.surfaceOne }]}
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
    </>
  );
}
