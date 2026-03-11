import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scrollProps } from "../../../hooks/useTopPadding";
import { colors } from "../../../styles/commonStyles";
import { useAuth } from "../../../contexts/AuthContext";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { IconSymbol } from "../../../components/IconSymbol";

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
  const { width } = useWindowDimensions();
  const gap = 12;
  const padding = 20;
  const columns = 2;
  const cardWidth = (width - padding * 2 - gap * (columns - 1)) / columns;

  const visibleItems = MORE_ITEMS.filter((item) =>
    item.roles.includes(userRole || ""),
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "More Details",
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
              <ProfileHeaderButton />
            </View>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.surfaceOne }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={styles.grid}>
          {visibleItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.gridCard, { width: cardWidth }]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.gridIconHolder}>
                <IconSymbol
                  ios_icon_name={item.icon.iosName}
                  android_material_icon_name={item.icon.androidName}
                  size={22}
                  color={colors.textSecondary}
                />
              </View>

              <Text style={styles.gridCardLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    columnGap: 10,
    rowGap: 10,
  },
  gridCard: {
    backgroundColor: colors.container,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "flex-start",
    gap: 0,
  },
  gridIconHolder: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: colors.surfaceTwo,
    alignItems: "center",
    justifyContent: "center",
  },
  gridCardLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "500",
    color: colors.text,
    marginTop: 8,
  },
});
