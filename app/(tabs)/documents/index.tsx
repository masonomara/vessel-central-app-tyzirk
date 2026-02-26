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

export default function DocumentsScreen() {
  const topPadding = useTopPadding();
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
    ({ item: doc }: { item: Document }) => (
      <TouchableOpacity
        key={doc.id}
        style={[
          styles.documentCard,
          doc.isImportant && styles.documentCardImportant,
          doc.expiryDate &&
            isOverdue(doc.expiryDate) &&
            styles.documentCardExpired,
        ]}
        onPress={() => handleDocumentPress(doc)}
        activeOpacity={0.7}
      >
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <IconSymbol
              ios_icon_name="doc.fill"
              android_material_icon_name={getCategoryIcon(doc.category)}
              size={32}
              color={colors.accent}
            />
          </View>
          <View style={styles.documentInfo}>
            <View style={styles.documentTitleRow}>
              <Text style={styles.documentTitle}>{doc.title}</Text>
              {doc.isImportant && (
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={16}
                  color={colors.gold}
                />
              )}
            </View>
            <Text style={styles.documentDescription} numberOfLines={1}>
              {doc.description}
            </Text>
          </View>
        </View>

        <View style={styles.documentMeta}>
          <View style={styles.metaItem}>
            <IconSymbol
              ios_icon_name="sailboat.fill"
              android_material_icon_name="sailing"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>{doc.vesselName}</Text>
          </View>
          <View style={styles.metaItem}>
            <IconSymbol
              ios_icon_name="doc.text"
              android_material_icon_name="insert-drive-file"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>
              {formatFileSize(doc.fileSize)}
            </Text>
          </View>
        </View>

        {doc.expiryDate && (
          <View
            style={[
              styles.expiryContainer,
              isOverdue(doc.expiryDate) &&
                styles.expiryContainerExpired,
            ]}
          >
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="event"
              size={16}
              color={
                isOverdue(doc.expiryDate)
                  ? colors.danger
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.expiryText,
                isOverdue(doc.expiryDate) && styles.expiryTextExpired,
              ]}
            >
              {isOverdue(doc.expiryDate) ? "Expired" : "Expires"}:{" "}
              {formatDueDate(doc.expiryDate)}
            </Text>
          </View>
        )}

        {doc.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {doc.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.documentFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {doc.category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.uploadedText}>
            Uploaded {formatDate(doc.uploadedAt)}
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
        contentContainerStyle={[styles.listContent, { paddingTop: topPadding }]}
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
    backgroundColor: colors.surfaceOne,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentCardImportant: {},
  documentCardExpired: {},
  documentHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  documentIconContainer: {
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  documentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  documentMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  expiryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceOne,
    borderRadius: 8,
    marginBottom: 12,
  },
  expiryContainerExpired: {
    backgroundColor: colors.danger + "20",
  },
  expiryText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  expiryTextExpired: {
    color: colors.danger,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: colors.accent + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: "600",
  },
  documentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  categoryBadge: {
    backgroundColor: colors.primary + "30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
  },
  uploadedText: {
    fontSize: 12,
    color: colors.grey,
  },
});
