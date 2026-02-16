import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { IconSymbol } from "@/components/IconSymbol";
import { Document, DocumentCategory } from "@/types";
import { formatDate, formatDueDate, isOverdue } from "@/utils/dateUtils";
import { formatFileSize } from "@/utils/fileUtils";

const ITEMS_PER_PAGE = 10;

export default function DocumentsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { documents } = useData();
  const { userRole } = useAuth();
  const [filterCategory, setFilterCategory] = useState<
    DocumentCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesCategory =
        filterCategory === "all" || doc.category === filterCategory;
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      return matchesCategory && matchesSearch;
    });
  }, [documents, filterCategory, searchQuery]);

  const paginatedDocuments = useMemo(() => {
    return filteredDocuments.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredDocuments, currentPage]);

  const hasMore = useMemo(() => {
    return paginatedDocuments.length < filteredDocuments.length;
  }, [paginatedDocuments.length, filteredDocuments.length]);

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case "manual":
        return "book";
      case "insurance":
        return "shield";
      case "registration":
        return "badge";
      case "safety":
        return "health_and_safety";
      case "warranty":
        return "verified";
      case "invoice":
        return "receipt";
      case "receipt":
        return "receipt_long";
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

  const handleAddDocument = useCallback(() => {
    router.push("/add-document");
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);

      // Simulate loading delay for smooth UX
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsLoadingMore(false);
      }, 300);
    }
  }, [isLoadingMore, hasMore]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  const handleFilterChange = useCallback(
    (category: DocumentCategory | "all") => {
      setFilterCategory(category);
      setCurrentPage(1); // Reset to first page when filter changes
    },
    [],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
        {(userRole === "manager" || userRole === "owner") && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddDocument}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={32}
              color={colors.accent}
            />
          </TouchableOpacity>
        )}
      </View>

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
          onChangeText={handleSearchChange}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          "all",
          "manual",
          "insurance",
          "registration",
          "safety",
          "warranty",
          "invoice",
          "receipt",
          "other",
        ].map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              filterCategory === category && styles.filterChipActive,
            ]}
            onPress={() =>
              handleFilterChange(category as DocumentCategory | "all")
            }
          >
            <Text
              style={[
                styles.filterChipText,
                filterCategory === category && styles.filterChipTextActive,
              ]}
            >
              {category.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {paginatedDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="doc.text"
              android_material_icon_name="description"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No documents found</Text>
          </View>
        ) : (
          <>
            {paginatedDocuments.map((doc) => (
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
                      android_material_icon_name="insert_drive_file"
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
            ))}

            {isLoadingMore && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.loadingMoreText}>
                  Loading more documents...
                </Text>
              </View>
            )}

            {!isLoadingMore && hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
              >
                <Text style={styles.loadMoreText}>Load More</Text>
                <IconSymbol
                  ios_icon_name="chevron.down"
                  android_material_icon_name="expand_more"
                  size={20}
                  color={colors.accent}
                />
              </TouchableOpacity>
            )}

            {!hasMore && paginatedDocuments.length > 0 && (
              <View style={styles.endOfList}>
                <Text style={styles.endOfListText}>
                  Showing all {paginatedDocuments.length} document
                  {paginatedDocuments.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
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
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
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
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentCardImportant: {
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  documentCardExpired: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
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
    backgroundColor: colors.background,
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
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent,
  },
  loadingMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  loadingMoreText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  endOfList: {
    alignItems: "center",
    paddingVertical: 20,
  },
  endOfListText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
});
