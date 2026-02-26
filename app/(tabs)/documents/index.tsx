import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  FlatList,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { Document } from "../../../types";
import { formatDate, formatDueDate, isOverdue } from "../../../utils/dateUtils";
import { formatFileSize } from "../../../utils/fileUtils";
import { useTopPadding } from "../../../hooks/useTopPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "manual":
        return "book";
      case "insurance":
        return "shield";
      case "registration":
        return "badge";
      case "safety":
        return "health-and-safety";
      case "warranty":
        return "verified";
      case "invoice":
        return "receipt";
      case "receipt":
        return "receipt-long";
      default:
        return "description";
    }
  };

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
        style={[styles.documentCard, index === section.data.length - 1 && styles.documentCardLast]}
        onPress={() => handleDocumentPress(doc)}
      >
        <View style={styles.topRow}>
          <Text style={styles.documentTitle} numberOfLines={2}>
            {doc.title}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.documentDescription} numberOfLines={2}>
            {doc.description}
          </Text>
        </View>
        <View style={styles.docMeta}>
          <Text style={styles.metaText}>
            {doc.vesselName} • {formatDate(doc.uploadedAt)}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [handleDocumentPress],
  );

  const keyExtractor = useCallback((item: Document) => item.id, []);

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
            android_material_icon_name={collapsed ? "chevron-right" : "expand-more"}
            size={18}
            color={colors.textSecondary}
            style={indexScreenStyles.dropdown}
          />
          <Text style={indexScreenStyles.sectionHeader}>{section.title}</Text>
          <Text style={indexScreenStyles.sectionCount}> {section.count}</Text>
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
            placeholder="Search documents..."
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
                    filterVessel === vessel && indexScreenStyles.filterChipTextActive,
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
      </>
    ),
    [searchQuery, filterVessel, vesselNames],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyState}>
        <IconSymbol
          ios_icon_name="doc.text"
          android_material_icon_name="description"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyStateText}>No documents found</Text>
      </View>
    ),
    [],
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surfaceOne }]}
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
  },
  documentCard: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.surfaceOne,
    marginBottom: 10,
  },
  documentCardLast: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    gap: 16,
  },
  documentTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: colors.text,
    flex: 1,
  },
  bottomRow: {},
  documentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 15,
  },
  docMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
});
