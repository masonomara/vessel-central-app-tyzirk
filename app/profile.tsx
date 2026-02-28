import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "expo-router";
import { colors, detailScreenStyles as ds } from "../styles/commonStyles";
import { scrollProps } from "../hooks/useTopPadding";
import { DetailRow } from "../components/DetailRow";
import { formatLabel } from "../utils/formatLabel";

type NotificationCategory =
  | "maintenance"
  | "issues"
  | "supplies"
  | "documents"
  | "tasks"
  | "approvals";

const CATEGORIES: { key: NotificationCategory; label: string }[] = [
  { key: "maintenance", label: "Maintenance" },
  { key: "issues", label: "Issues" },
  { key: "supplies", label: "Supplies" },
  { key: "documents", label: "Documents" },
  { key: "tasks", label: "Tasks" },
  { key: "approvals", label: "Approvals" },
];

export default function ProfileScreen() {
  const { signOut, userName, userRole } = useAuth();
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [categoryEnabled, setCategoryEnabled] = useState<
    Record<NotificationCategory, boolean>
  >({
    maintenance: true,
    issues: true,
    supplies: true,
    documents: true,
    tasks: true,
    approvals: true,
  });

  const toggleCategory = useCallback(
    (key: NotificationCategory, value: boolean) => {
      setCategoryEnabled((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await signOut();

            if (error) {
              Alert.alert("Error", "Failed to log out. Please try again.");
              return;
            }

            setTimeout(() => {
              router.replace("/login");
            }, 100);
          } catch {
            Alert.alert(
              "Error",
              "An unexpected error occurred. Please try again.",
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Profile",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        contentContainerStyle={[ds.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={[ds.titleSection, {marginBottom: 20}]}>
          <Text style={ds.subtitle}>
            {userRole ? formatLabel(userRole) : "Member"}
          </Text>
          <Text style={ds.title}>{userName || "User"}</Text>
        </View>

        <DetailRow label="Email" value="user@example.com" inline />
        <DetailRow label="Phone" value="+1 (555) 123-4567" inline />
        <DetailRow label="Location" value="San Francisco, CA" inline />

        <View style={styles.notificationSection}>
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>All Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surfaceOne}
            />
          </View>
          {notificationsEnabled &&
            CATEGORIES.map((cat) => (
              <View key={cat.key} style={styles.switchRow}>
                <Text style={styles.switchLabelSecondary}>{cat.label}</Text>
                <Switch
                  value={categoryEnabled[cat.key]}
                  onValueChange={(v) => toggleCategory(cat.key, v)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surfaceOne}
                />
              </View>
            ))}
        </View>

        <DetailRow
          button={{
            label: "Log Out",
            onPress: handleLogout,
            color: colors.danger,
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceOne,
  },
  notificationSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.surfaceOne,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.text,
  },
  switchLabelSecondary: {
    fontSize: 15,
    color: colors.text,
  },
});
