import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { useTopPadding } from "../../../hooks/useTopPadding";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { SupplyRequest, SupplyRequestStatus } from "../../../types";
import { formatDate } from "../../../utils/dateUtils";
import { getPriorityBadgeColors } from "../../../utils/colorUtils";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SupplyRequestItem = React.memo(
  ({
    request,
    onPress,
    onApprove,
    onDeny,
    showActions,
    isLast,
  }: {
    request: SupplyRequest;
    onPress: (request: SupplyRequest) => void;
    onApprove: (id: string) => void;
    onDeny: (id: string) => void;
    showActions: boolean;
    isLast: boolean;
  }) => {
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
        style={[styles.requestCard, isLast && styles.requestCardLast]}
        onPress={handlePress}
      >
        <View style={styles.topRow}>
          <Text style={styles.requestTitle} numberOfLines={2}>
            {request.itemName} - ${request.estimatedCost}
          </Text>
          <Text
            style={[
              styles.priorityText,
              { color: getPriorityBadgeColors(request.priority).fg },
              { backgroundColor: getPriorityBadgeColors(request.priority).bg },
            ]}
          >
            {request.priority.charAt(0).toUpperCase() +
              request.priority.slice(1)}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.requestDescription} numberOfLines={2}>
            {request.description}
          </Text>
        </View>
        <View style={styles.requestMeta}>
          <Text style={styles.metaText}>
            {request.vesselName} • {formatDate(request.createdAt)}
          </Text>
        </View>
        {showActions && request.status === "pending" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={handleApprove}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.denyButton} onPress={handleDeny}>
              <Text style={styles.denyButtonText}>Deny</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

export default function SuppliesScreen() {
  const topPadding = useTopPadding();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { supplyRequests, approveSupplyRequest, denySupplyRequest } = useData();
  const { userRole, userId, userName } = useAuth();
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const vesselNames = useMemo(() => {
    const names = new Set<string>();
    supplyRequests.forEach((r) => {
      if (r.vesselName) names.add(r.vesselName);
    });
    return Array.from(names).sort();
  }, [supplyRequests]);

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
      const matchesVessel =
        filterVessel === "all" || request.vesselName === filterVessel;
      const matchesSearch =
        request.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesVessel && matchesSearch;
    });

    const needsApproval = filtered.filter((r) => r.status === "pending");
    const pending = filtered.filter((r) => r.status === "approved");
    const ordered = filtered.filter((r) => r.status === "ordered");
    const received = filtered.filter((r) => r.status === "received");
    const denied = filtered.filter((r) => r.status === "denied");

    const sectionDefs: { title: string; items: SupplyRequest[] }[] = [
      { title: "Needs Approval", items: needsApproval },
      { title: "Pending", items: pending },
      { title: "Ordered", items: ordered },
      { title: "Received", items: received },
      { title: "Denied", items: denied },
    ];

    return sectionDefs
      .filter((s) => s.items.length > 0)
      .map((s) => ({
        title: s.title,
        count: s.items.length,
        data: collapsedSections.has(s.title) ? [] : s.items,
      }));
  }, [supplyRequests, filterVessel, searchQuery, collapsedSections]);

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
    ({
      item,
      index,
      section,
    }: {
      item: SupplyRequest;
      index: number;
      section: { data: SupplyRequest[] };
    }) => (
      <SupplyRequestItem
        request={item}
        onPress={handleRequestPress}
        onApprove={handleApprove}
        onDeny={handleDeny}
        showActions={userRole === "manager" || userRole === "owner"}
        isLast={index === section.data.length - 1}
      />
    ),
    [handleRequestPress, handleApprove, handleDeny, userRole],
  );

  const keyExtractor = useCallback((item: SupplyRequest) => item.id, []);

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
            android_material_icon_name={
              collapsed ? "chevron-right" : "expand-more"
            }
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
            placeholder="Search supplies..."
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
                    filterVessel === vessel &&
                      indexScreenStyles.filterChipTextActive,
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
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen
        options={{
          title: "Supplies",
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              {userRole === "crew" && (
                <TouchableOpacity
                  onPress={() => router.push("/add-supply-request")}
                >
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
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: topPadding, paddingBottom: insets.bottom + 64 },
        ]}
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
  requestCard: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.surfaceOne,
    marginBottom: 10,
  },
  requestCardLast: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    gap: 16,
  },
  requestTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: colors.text,
    flex: 1,
  },
  priorityText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "500",
    borderRadius: 4,
    padding: 4,
    paddingVertical: 0,
    lineHeight: 20,
    height: 20,
    marginRight: 0,
    marginTop: 0,
  },
  bottomRow: {},
  requestDescription: {
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
  requestMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,

    paddingTop: 16,
  },
  approveButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.greenForeground,
    paddingVertical: 8,
    borderRadius: 8,
  },
  approveButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.container,
  },
  denyButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.redForeground,
    paddingVertical: 8,
    borderRadius: 8,
  },
  denyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.container,
  },
});
