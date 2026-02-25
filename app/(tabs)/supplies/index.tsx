import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { useTopPadding } from "../../../hooks/useTopPadding";
import { colors } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { SupplyRequest, SupplyRequestStatus } from "../../../types";
import { formatDate } from "../../../utils/dateUtils";

const SupplyRequestItem = React.memo(
  ({
    request,
    onPress,
    onApprove,
    onDeny,
    userRole,
  }: {
    request: SupplyRequest;
    onPress: (request: SupplyRequest) => void;
    onApprove: (id: string) => void;
    onDeny: (id: string) => void;
    userRole: string | null;
  }) => {
    const getStatusColor = (status: SupplyRequestStatus) => {
      switch (status) {
        case "approved":
          return colors.success;
        case "ordered":
          return colors.accent;
        case "received":
          return colors.success;
        case "denied":
          return colors.danger;
        case "pending":
          return colors.warning;
        default:
          return colors.grey;
      }
    };

    const handlePress = useCallback(() => {
      onPress(request);
    }, [request, onPress]);

    const handleApprove = useCallback(() => {
      onApprove(request.id);
    }, [request.id, onApprove]);

    const handleDeny = useCallback(() => {
      onDeny(request.id);
    }, [request.id, onDeny]);

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.requestHeader}>
          <View style={styles.requestTitleRow}>
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="inventory-2"
              size={24}
              color={colors.accent}
            />
            <Text style={styles.requestTitle}>{request.itemName}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(request.status) + "30" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(request.status) },
              ]}
            >
              {request.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.requestDescription} numberOfLines={2}>
          {request.description}
        </Text>

        <View style={styles.requestDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>
              {request.quantity} {request.unit}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Est. Cost:</Text>
            <Text style={styles.detailValue}>
              ${request.estimatedCost.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.requestMeta}>
          <View style={styles.metaItem}>
            <IconSymbol
              ios_icon_name="sailboat.fill"
              android_material_icon_name="sailing"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>{request.vesselName}</Text>
          </View>
          <View style={styles.metaItem}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>{request.requestedByName}</Text>
          </View>
        </View>

        <View style={styles.requestFooter}>
          <Text style={styles.timeText}>{formatDate(request.createdAt)}</Text>
          {(userRole === "manager" || userRole === "owner") && request.status === "pending" && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={handleApprove}
              >
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.denyButton} onPress={handleDeny}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={20}
                  color={colors.danger}
                />
                <Text style={styles.denyButtonText}>Deny</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {request.approvedByName && (
          <View style={styles.approvalInfo}>
            <Text style={styles.approvalText}>
              Approved by {request.approvedByName}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

export default function SuppliesScreen() {
  const topPadding = useTopPadding();
  const router = useRouter();
  const { supplyRequests, approveSupplyRequest, denySupplyRequest } = useData();
  const { userRole, userId, userName } = useAuth();
  const [filterStatus, setFilterStatus] = useState<SupplyRequestStatus | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

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
    const filtered = supplyRequests.filter((request) => {
      const matchesStatus =
        filterStatus === "all" || request.status === filterStatus;
      const matchesSearch =
        request.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    const pending = filtered.filter((r) => r.status === "pending");
    const approved = filtered.filter(
      (r) => r.status === "approved" || r.status === "ordered" || r.status === "received",
    );
    const denied = filtered.filter((r) => r.status === "denied");

    const result: { title: string; count: number; data: SupplyRequest[] }[] = [];
    if (pending.length > 0)
      result.push({
        title: "Needs Approval",
        count: pending.length,
        data: collapsedSections.has("Needs Approval") ? [] : pending,
      });
    if (approved.length > 0)
      result.push({
        title: "Approved",
        count: approved.length,
        data: collapsedSections.has("Approved") ? [] : approved,
      });
    if (denied.length > 0)
      result.push({
        title: "Denied",
        count: denied.length,
        data: collapsedSections.has("Denied") ? [] : denied,
      });
    return result;
  }, [supplyRequests, filterStatus, searchQuery, collapsedSections]);

  const handleApprove = useCallback(
    (id: string) => {
      approveSupplyRequest(id, userId, userName);
    },
    [approveSupplyRequest, userId, userName],
  );

  const handleDeny = useCallback(
    (id: string) => {
      denySupplyRequest(id, "Request not approved at this time");
    },
    [denySupplyRequest],
  );

  const handleRequestPress = useCallback(
    (request: SupplyRequest) => {
      router.push({ pathname: "/supply-detail", params: { id: request.id } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: SupplyRequest }) => (
      <SupplyRequestItem
        request={item}
        onPress={handleRequestPress}
        onApprove={handleApprove}
        onDeny={handleDeny}
        userRole={userRole}
      />
    ),
    [handleRequestPress, handleApprove, handleDeny, userRole],
  );

  const keyExtractor = useCallback((item: SupplyRequest) => item.id, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; count: number } }) => {
      const collapsed = collapsedSections.has(section.title);
      return (
        <TouchableOpacity
          style={styles.sectionHeaderRow}
          onPress={() => toggleSection(section.title)}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionHeader}>
            {section.title}
            <Text style={styles.sectionCount}> ({section.count})</Text>
          </Text>
          <IconSymbol
            ios_icon_name={collapsed ? "chevron.right" : "chevron.down"}
            android_material_icon_name={collapsed ? "chevron-right" : "expand-more"}
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
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
            placeholder="Search supplies..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              "all",
              "pending",
              "approved",
              "denied",
              "ordered",
              "received",
            ]}
            renderItem={({ item: status }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterStatus === status && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilterStatus(status as SupplyRequestStatus | "all")
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === status && styles.filterChipTextActive,
                  ]}
                >
                  {status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterContent}
          />
        </View>
      </>
    ),
    [searchQuery, filterStatus],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyState}>
        <IconSymbol
          ios_icon_name="shippingbox"
          android_material_icon_name="inventory-2"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyStateText}>No supply requests found</Text>
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
          title: "Supplies",
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              {userRole === "crew" && (
                <TouchableOpacity onPress={() => router.push("/add-supply-request")}>
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontWeight: "400",
    textTransform: "none",
    letterSpacing: 0,
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
  requestCard: {
    backgroundColor: colors.surfaceOne,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  requestTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
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
  requestDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  requestDetails: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  requestMeta: {
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
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: colors.grey,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  approveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.success + "30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  approveButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.success,
  },
  denyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.danger + "30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  denyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.danger,
  },
  approvalInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  approvalText: {
    fontSize: 12,
    color: colors.success,
    fontStyle: "italic",
  },
});
