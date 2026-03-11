import React, { useState, useMemo, useCallback } from "react";
import { View, Text, SectionList, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { scrollProps } from "../../../hooks/useTopPadding";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ItemCard } from "../../../components/ItemCard";
import { CrewCertification, CertificationStatus } from "../../../types";
import { formatDate } from "../../../utils/formatting";
import { SearchBar } from "../../../components/SearchBar";
import { FilterRow } from "../../../components/FilterRow";
import { CollapsibleSectionHeader } from "../../../components/CollapsibleSectionHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getCertStatus(expiryDate: Date): CertificationStatus {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "expired";
  if (diffDays < 30) return "expiring_soon";
  return "valid";
}

function getStatusBadge(status: CertificationStatus): {
  fg: string;
  bg: string;
  label: string;
} {
  switch (status) {
    case "expired":
      return {
        fg: colors.redForeground,
        bg: colors.redBackground,
        label: "Expired",
      };
    case "expiring_soon":
      return {
        fg: colors.orangeForeground,
        bg: colors.orangeBackground,
        label: "Expiring Soon",
      };
    case "valid":
      return {
        fg: colors.greenForeground,
        bg: colors.greenBackground,
        label: "Valid",
      };
  }
}

export default function CertificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { certifications, getCertificationsForUser } = useData();
  const { userId, userRole } = useAuth();
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const userCerts = useMemo(
    () => getCertificationsForUser(userId, userRole || "crew"),
    [certifications, userId, userRole],
  );

  const vesselNames = useMemo(() => {
    const names = new Set<string>();
    userCerts.forEach((cert) => {
      if (cert.vesselName) names.add(cert.vesselName);
    });
    return Array.from(names).sort();
  }, [userCerts]);

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
    const filtered = userCerts.filter((cert) => {
      const matchesVessel =
        filterVessel === "all" || cert.vesselName === filterVessel;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        cert.certType.toLowerCase().includes(q) ||
        cert.crewName.toLowerCase().includes(q) ||
        cert.issuingAuthority.toLowerCase().includes(q);
      return matchesVessel && matchesSearch;
    });

    const expired: CrewCertification[] = [];
    const expiringSoon: CrewCertification[] = [];
    const valid: CrewCertification[] = [];

    filtered.forEach((cert) => {
      const status = getCertStatus(cert.expiryDate);
      if (status === "expired") expired.push(cert);
      else if (status === "expiring_soon") expiringSoon.push(cert);
      else valid.push(cert);
    });

    const sectionDefs = [
      { title: "Expired", items: expired },
      { title: "Expiring Soon", items: expiringSoon },
      { title: "Valid", items: valid },
    ];

    return sectionDefs
      .filter((s) => s.items.length > 0)
      .map((s) => ({
        title: s.title,
        count: s.items.length,
        data: collapsedSections.has(s.title) ? [] : s.items,
      }));
  }, [userCerts, filterVessel, searchQuery, collapsedSections]);

  const handleCertPress = useCallback(
    (cert: CrewCertification) => {
      router.push({
        pathname: "/certification-detail",
        params: { id: cert.id },
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
      item: CrewCertification;
      index: number;
      section: { data: CrewCertification[] };
    }) => {
      const status = getCertStatus(item.expiryDate);
      const badge = getStatusBadge(status);

      return (
        <ItemCard
          title={item.certType}
          description={`${item.crewName} — ${item.issuingAuthority}`}
          vesselName={item.vesselName}
          onPress={() => handleCertPress(item)}
          isFirst={index === 0}
          isLast={index === section.data.length - 1}
          badge={{
            label: badge.label,
            fg: badge.fg,
            bg: badge.bg,
          }}
          metaText={`Expires ${formatDate(new Date(item.expiryDate))}`}
        />
      );
    },
    [handleCertPress],
  );

  const keyExtractor = useCallback(
    (item: CrewCertification) => item.id,
    [],
  );

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
          placeholder="Search certifications..."
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
          color={colors.grey}
        />
        <Text style={indexScreenStyles.emptyStateText}>
          No certifications found
        </Text>
      </View>
    ),
    [],
  );

  return (
    <View
      style={[
        indexScreenStyles.container,
        { backgroundColor: colors.surfaceOne },
      ]}
    >
      <Stack.Screen
        options={{
          title: "Certifications",
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <TouchableOpacity
                onPress={() => router.push("/add-certification")}
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
    </View>
  );
}
