import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { scrollProps } from "../../../hooks/useTopPadding";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ListItemCard } from "../../../components/ListItemCard";
import { SupplyRequest } from "../../../types";
import { formatDate, getPriorityBadgeColors } from "../../../utils/formatting";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "../../../components/SearchBar";
import { FilterRow } from "../../../components/FilterRow";
import { CollapsibleSectionHeader } from "../../../components/CollapsibleSectionHeader";

export default function SuppliesScreen() {
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
    const approved = filtered.filter((r) => r.status === "approved");
    const ordered = filtered.filter((r) => r.status === "ordered");
    const received = filtered.filter((r) => r.status === "received");
    const denied = filtered.filter((r) => r.status === "denied");

    const sectionDefs: { title: string; items: SupplyRequest[] }[] = [
      { title: "Needs Approval", items: needsApproval },
      { title: "Approved", items: approved },
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
      router.push({ pathname: "/detail-supply", params: { id: request.id } });
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
      <ListItemCard
        title={`${item.itemName} - $${item.estimatedCost}`}
        description={item.description}
        vesselName={item.vesselName}
        isFirst={index === 0}
        onPress={() => handleRequestPress(item)}
        isLast={index === section.data.length - 1}
        icon={{ iosName: "shippingbox", androidName: "inventory-2" }}
        badge={{
          label: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
          fg: getPriorityBadgeColors(item.priority).fg,
          bg: getPriorityBadgeColors(item.priority).bg,
        }}
        metaText={formatDate(item.createdAt)}
        actions={
          (userRole === "manager" || userRole === "owner") && item.status === "pending" ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(item.id)}>
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.denyButton} onPress={() => handleDeny(item.id)}>
                <Text style={styles.denyButtonText}>Deny</Text>
              </TouchableOpacity>
            </View>
          ) : undefined
        }
      />
    ),
    [handleRequestPress, handleApprove, handleDeny, userRole],
  );

  const keyExtractor = useCallback((item: SupplyRequest) => item.id, []);

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
          placeholder="Search supplies..."
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
          No supply requests found
        </Text>
      </View>
    ),
    [],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Supplies",
          headerLargeTitle: true,
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

const styles = StyleSheet.create({
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
