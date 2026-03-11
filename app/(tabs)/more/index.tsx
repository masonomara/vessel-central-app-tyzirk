import { View, StyleSheet, ScrollView } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scrollProps } from "../../../hooks/useTopPadding";
import { colors } from "../../../styles/commonStyles";
import { useAuth } from "../../../contexts/AuthContext";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { GroupedListContainer } from "../../../components/GroupedListContainer";
import { ListItemCard } from "../../../components/ListItemCard";

type MoreItem = {
  key: string;
  label: string;
  route: string;
  icon: { iosName: string; androidName: string };
  roles: string[];
};

const MORE_ITEMS: MoreItem[] = [
  {
    key: "supplies",
    label: "Supplies",
    route: "/(tabs)/more/supplies",
    icon: { iosName: "shippingbox.fill", androidName: "inventory-2" },
    roles: ["owner", "manager"],
  },
  {
    key: "documents",
    label: "Documents",
    route: "/(tabs)/more/documents",
    icon: { iosName: "doc.text.fill", androidName: "description" },
    roles: ["owner"],
  },
  {
    key: "contacts",
    label: "Contacts",
    route: "/(tabs)/more/contacts",
    icon: { iosName: "person.2.fill", androidName: "contacts" },
    roles: ["owner", "manager"],
  },
  {
    key: "certifications",
    label: "Certifications",
    route: "/(tabs)/more/certifications",
    icon: { iosName: "checkmark.seal.fill", androidName: "verified" },
    roles: ["owner", "manager"],
  },
  {
    key: "charters",
    label: "Charters",
    route: "/(tabs)/more/charters",
    icon: { iosName: "sailboat.fill", androidName: "directions-boat" },
    roles: ["owner", "manager"],
  },
  {
    key: "equipment",
    label: "Equipment",
    route: "/(tabs)/more/equipment",
    icon: { iosName: "lifepreserver.fill", androidName: "inventory" },
    roles: ["owner", "manager"],
  },
];

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userRole } = useAuth();

  const visibleItems = MORE_ITEMS.filter((item) =>
    item.roles.includes(userRole || ""),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen
        options={{
          title: "",
          headerRight: () => <ProfileHeaderButton />,
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 64 },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <GroupedListContainer>
          {visibleItems.map((item, index) => (
            <ListItemCard
              key={item.key}
              title={item.label}
              description=""
              vesselName=""
              onPress={() => router.push(item.route as any)}
              isFirst={index === 0}
              isLast={index === visibleItems.length - 1}
              icon={item.icon}
              style={{ marginLeft: 0, backgroundColor: "transparent" }}
            />
          ))}
        </GroupedListContainer>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
});
