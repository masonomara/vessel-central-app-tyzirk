import React, { useState, useMemo, useCallback } from "react";
import { View, Text, SectionList, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { scrollProps } from "../../../hooks/useTopPadding";
import { colors, indexScreenStyles } from "../../../styles/commonStyles";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ListItemCard } from "../../../components/ListItemCard";
import { Contact, ContactType } from "../../../types";
import { SearchBar } from "../../../components/SearchBar";
import { FilterRow } from "../../../components/FilterRow";
import { CollapsibleSectionHeader } from "../../../components/CollapsibleSectionHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CONTACT_TYPE_BADGE: Record<
  ContactType,
  { fg: string; bg: string; label: string }
> = {
  crew: { fg: colors.blueForeground, bg: colors.blueBackground, label: "Crew" },
  vendor: {
    fg: colors.orangeForeground,
    bg: colors.orangeBackground,
    label: "Vendor",
  },
  marina: {
    fg: colors.greenForeground,
    bg: colors.greenBackground,
    label: "Marina",
  },
  emergency: {
    fg: colors.redForeground,
    bg: colors.redBackground,
    label: "Emergency",
  },
  owner: {
    fg: colors.purpleForeground,
    bg: colors.purpleBackground,
    label: "Owner",
  },
  other: {
    fg: colors.yellowForeground,
    bg: colors.yellowBackground,
    label: "Other",
  },
};

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { contacts, getContactsForUser } = useData();
  const { userId, userRole } = useAuth();
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const userContacts = useMemo(
    () => getContactsForUser(userId, userRole || "crew"),
    [contacts, userId, userRole],
  );

  const vesselNames = useMemo(() => {
    const names = new Set<string>();
    userContacts.forEach((c) => {
      c.vesselNames.forEach((v) => names.add(v));
    });
    return Array.from(names).sort();
  }, [userContacts]);

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
    const filtered = userContacts.filter((contact) => {
      const matchesVessel =
        filterVessel === "all" || contact.vesselNames.includes(filterVessel);
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        contact.name.toLowerCase().includes(q) ||
        contact.role.toLowerCase().includes(q) ||
        (contact.company || "").toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q);
      return matchesVessel && matchesSearch;
    });

    const groups: Record<ContactType, Contact[]> = {
      crew: [],
      vendor: [],
      marina: [],
      emergency: [],
      owner: [],
      other: [],
    };

    filtered.forEach((c) => {
      groups[c.contactType].push(c);
    });

    const order: ContactType[] = [
      "crew",
      "vendor",
      "marina",
      "emergency",
      "owner",
      "other",
    ];

    return order
      .filter((type) => groups[type].length > 0)
      .map((type) => ({
        title: CONTACT_TYPE_BADGE[type].label,
        count: groups[type].length,
        data: collapsedSections.has(CONTACT_TYPE_BADGE[type].label)
          ? []
          : groups[type],
      }));
  }, [userContacts, filterVessel, searchQuery, collapsedSections]);

  const handleContactPress = useCallback(
    (contact: Contact) => {
      router.push({ pathname: "/detail-contact", params: { id: contact.id } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: Contact;
      index: number;
      section: { data: Contact[] };
    }) => {
      const badge = CONTACT_TYPE_BADGE[item.contactType];
      const description = item.company
        ? `${item.role} — ${item.company}`
        : item.role;

      return (
        <ListItemCard
          title={item.name}
          description={description}
          vesselName={item.vesselNames[0]}
          onPress={() => handleContactPress(item)}
          isFirst={index === 0}
          isLast={index === section.data.length - 1}
          badge={{
            label: badge.label,
            fg: badge.fg,
            bg: badge.bg,
          }}
          metaText={item.phone}
        />
      );
    },
    [handleContactPress],
  );

  const keyExtractor = useCallback((item: Contact) => item.id, []);

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
          placeholder="Search contacts..."
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
          ios_icon_name="person.crop.circle"
          android_material_icon_name="person"
          size={64}
          color={colors.grey}
        />
        <Text style={indexScreenStyles.emptyStateText}>No contacts found</Text>
      </View>
    ),
    [],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Contacts",
          headerLargeTitleEnabled: true,
          headerLargeTitleStyle: {
            fontSize: 28,
            fontWeight: "600",
            color: colors.text,
          },
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginLeft: 4,
                marginRight: 4,
              }}
            >
              <TouchableOpacity onPress={() => router.push("/add-contact")}>
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={28}
                  color={colors.text}
                />
              </TouchableOpacity>
              <ProfileHeaderButton />
            </View>
          ),
        }}
      />

      <SectionList
        style={[
          indexScreenStyles.container,
          { backgroundColor: colors.surfaceOne },
        ]}
        sections={sections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={
          <View
            style={{
              height: insets.bottom,
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
