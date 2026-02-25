import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { useTopPadding } from "../../../hooks/useTopPadding";
import { colors } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { Issue, TaskStatus, TaskPriority } from "../../../types";
import { formatDate } from "../../../utils/dateUtils";

const ITEMS_PER_PAGE = 10;

const IssueItem = React.memo(
  ({ issue, onPress }: { issue: Issue; onPress: (issue: Issue) => void }) => {
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

    const getStatusColor = (status: TaskStatus) => {
      switch (status) {
        case "completed":
          return colors.success;
        case "in_progress":
          return colors.accent;
        case "waiting_on_parts":
          return colors.grey;
        case "open":
          return colors.grey;
        default:
          return colors.grey;
      }
    };

    const handlePress = useCallback(() => {
      onPress(issue);
    }, [issue, onPress]);

    return (
      <TouchableOpacity
        style={[
          styles.issueCard,
          issue.priority === "urgent" && styles.issueCardUrgent,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.issueHeader}>
          <View style={styles.issueTitleRow}>
            {/* <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="report-problem"
              size={24}
              color={getPriorityColor(issue.priority)}
            /> */}
            <Text style={styles.issueTitle}>{issue.title}</Text>
          </View>
        </View>

        <Text style={styles.issueDescription} numberOfLines={2}>
          {issue.description}
        </Text>

        {/* <View style={styles.issueMeta}>
          <View style={styles.metaItem}>
            <IconSymbol
              ios_icon_name="sailboat.fill"
              android_material_icon_name="sailing"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>{issue.vesselName}</Text>
          </View>
          <View style={styles.metaItem}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location-on"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>{issue.location}</Text>
          </View>
        </View> */}

        <View style={styles.issueFooter}>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(issue.priority) + "30" },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(issue.priority) },
              ]}
            >
              {issue.priority.toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(issue.status) + "30" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(issue.status) },
              ]}
            >
              {issue.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>
          <View style={styles.reportedBy}>
            <Text style={styles.reportedByText}>
              Reported by {issue.reportedByName}
            </Text>
            <Text style={styles.timeText}>{formatDate(issue.createdAt)}</Text>
          </View>
        </View>

        {/* {issue.attachments.length > 0 && (
          <View style={styles.attachmentsIndicator}>
            <IconSymbol
              ios_icon_name="paperclip"
              android_material_icon_name="attach-file"
              size={16}
              color={colors.accent}
            />
            <Text style={styles.attachmentsText}>
              {issue.attachments.length} attachment
              {issue.attachments.length > 1 ? "s" : ""}
            </Text>
          </View>
        )} */}

        {/* {issue.comments.length > 0 && (
          <View style={styles.commentsIndicator}>
            <IconSymbol
              ios_icon_name="bubble.left.fill"
              android_material_icon_name="comment"
              size={16}
              color={colors.accent}
            />
            <Text style={styles.commentsText}>
              {issue.comments.length} comment
              {issue.comments.length > 1 ? "s" : ""}
            </Text>
          </View>
        )} */}
      </TouchableOpacity>
    );
  },
);

export default function IssuesScreen() {
  const topPadding = useTopPadding();
  const router = useRouter();
  const { issues } = useData();
  const { userRole } = useAuth();
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesStatus =
        filterStatus === "all" || issue.status === filterStatus;
      const matchesSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [issues, filterStatus, searchQuery]);

  const paginatedIssues = useMemo(() => {
    return filteredIssues.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredIssues, currentPage]);

  const hasMore = useMemo(() => {
    return paginatedIssues.length < filteredIssues.length;
  }, [paginatedIssues.length, filteredIssues.length]);

  const handleIssuePress = useCallback(
    (issue: Issue) => {
      router.push({ pathname: "/issue-detail", params: { id: issue.id } });
    },
    [router],
  );

  const handleAddIssue = useCallback(() => {
    router.push("/add-issue");
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

  const handleFilterChange = useCallback((status: TaskStatus | "all") => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Issue }) => (
      <IssueItem issue={item} onPress={handleIssuePress} />
    ),
    [handleIssuePress],
  );

  const keyExtractor = useCallback((item: Issue) => item.id, []);

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
            placeholder="Search issues..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              "all",
              "open",
              "in_progress",
              "waiting_on_parts",
              "completed",
            ]}
            renderItem={({ item: status }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterStatus === status && styles.filterChipActive,
                ]}
                onPress={() => handleFilterChange(status as TaskStatus | "all")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === status && styles.filterChipTextActive,
                  ]}
                >
                  {status.replace("_", " ").toUpperCase()}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterContent}
          />
        </View>
      </>
    ),
    [searchQuery, filterStatus, handleSearchChange, handleFilterChange],
  );

  const ListFooterComponent = useCallback(() => {
    if (paginatedIssues.length === 0) {
      return null;
    }

    if (isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={colors.danger} />
          <Text style={styles.loadingMoreText}>Loading more issues...</Text>
        </View>
      );
    }

    if (hasMore) {
      return (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
          <IconSymbol
            ios_icon_name="chevron.down"
            android_material_icon_name="expand-more"
            size={20}
            color={colors.danger}
          />
        </TouchableOpacity>
      );
    }
  }, [paginatedIssues.length, isLoadingMore, hasMore, handleLoadMore]);

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

      <FlatList
        data={paginatedIssues}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={[styles.listContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
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
    backgroundColor: colors.surfaceOne,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.text,
  },
  listContent: {
    paddingBottom: 20,
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
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  issueCard: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  issueCardUrgent: {},
  issueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  issueTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  issueTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  priorityBadge: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
    borderRadius: 4,
    padding: 6,
    paddingVertical: 0,
    lineHeight: 24,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  issueDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
    marginTop: 6,
  },
  issueMeta: {
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
  issueFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  reportedBy: {
    alignItems: "flex-end",
  },
  reportedByText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timeText: {
    fontSize: 11,
    color: colors.grey,
    marginTop: 2,
  },
  attachmentsIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachmentsText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "500",
  },
  commentsIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  commentsText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "500",
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceOne,
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
    color: colors.danger,
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
