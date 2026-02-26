import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { Document } from "../../../types";
import { formatDate } from "../../../utils/dateUtils";
import { useTopPadding } from "../../../hooks/useTopPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "../../../components/SearchBar";
import { FilterRow } from "../../../components/FilterRow";
import { CollapsibleSectionHeader } from "../../../components/CollapsibleSectionHeader";

export default function DocumentsScreen() {
  const topPadding = useTopPadding();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { documents } = useData();
  const { userRole } = useAuth();
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

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
        data: collapsedSections.has(category.charAt(0).toUpperCase() + category.slice(1)) ? [] : items,
      }));
  }, [documents, filterVessel, searchQuery, collapsedSections]);

  const handleDocumentPress = useCallback(
    (doc: Document) => {
      router.push({ pathname: "/document-detail", params: { id: doc.id } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item: doc, index, section }: { item: Document; index: number; section: { data: Document[] } }) => (
      <TouchableOpacity
        key={doc.id}
        style={[indexScreenStyles.card, index === section.data.length - 1 && indexScreenStyles.cardLast]}
        onPress={() => handleDocumentPress(doc)}
      >
        <View style={indexScreenStyles.topRow}>
          <Text style={indexScreenStyles.cardTitle} numberOfLines={2}>
            {doc.title}
          </Text>
        </View>
        <Text style={indexScreenStyles.cardDescription} numberOfLines={2}>
          {doc.description}
        </Text>
        <View style={indexScreenStyles.metaRow}>
          <Text style={indexScreenStyles.metaText}>
            {doc.vesselName} • {formatDate(doc.uploadedAt)}
          </Text>
        </View>
      </TouchableOpacity>
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
    <View
      style={[indexScreenStyles.container, { backgroundColor: colors.surfaceOne }]}
    >
      <Stack.Screen
        options={{
          title: "Documents",
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
