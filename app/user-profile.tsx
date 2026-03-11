import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, detailScreenStyles as ds } from "../styles/commonStyles";
import { scrollProps } from "../hooks/useTopPadding";
import { DetailRow } from "../components/DetailRow";
import { formatLabel } from "../utils/formatting";

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
  const insets = useSafeAreaInsets();
  const { signOut, userName, userRole, userId } = useAuth();

  const USER_PROFILES: Record<string, { email: string; phone: string; location: string }> = {
    owner1: { email: 'diane@vesselco.com', phone: '+1 (340) 775-1001', location: 'St. Thomas, USVI' },
    manager1: { email: 'brett@vesselco.com', phone: '+1 (340) 775-1002', location: 'St. Thomas, USVI' },
    crew1: { email: 'marcus@vesselco.com', phone: '+1 (340) 775-1003', location: 'St. Thomas, USVI' },
    crew2: { email: 'tanya@vesselco.com', phone: '+1 (340) 775-1004', location: 'St. Thomas, USVI' },
  };

  const profile = USER_PROFILES[userId] || {
    email: userName ? `${userName.split(' ')[0].toLowerCase()}@vesselco.com` : 'user@vesselco.com',
    phone: '+1 (340) 775-1000',
    location: 'St. Thomas, USVI',
  };
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

  const storageKey = `@vessel_notif_prefs_${userId}`;

  useEffect(() => {
    if (!userId) return;
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (!raw) return;
      try {
        const prefs = JSON.parse(raw);
        if (typeof prefs.enabled === "boolean") setNotificationsEnabled(prefs.enabled);
        if (prefs.categories) setCategoryEnabled((prev) => ({ ...prev, ...prefs.categories }));
      } catch {}
    });
  }, [userId, storageKey]);

  const savePrefs = useCallback(
    (enabled: boolean, categories: Record<NotificationCategory, boolean>) => {
      AsyncStorage.setItem(storageKey, JSON.stringify({ enabled, categories }));
    },
    [storageKey],
  );

  const handleToggleAll = useCallback(
    (value: boolean) => {
      setNotificationsEnabled(value);
      savePrefs(value, categoryEnabled);
    },
    [categoryEnabled, savePrefs],
  );

  const toggleCategory = useCallback(
    (key: NotificationCategory, value: boolean) => {
      setCategoryEnabled((prev) => {
        const next = { ...prev, [key]: value };
        savePrefs(notificationsEnabled, next);
        return next;
      });
    },
    [notificationsEnabled, savePrefs],
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
              router.replace("/user-login");
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
        style={styles.scrollView}
        contentContainerStyle={[
          ds.scrollContent,
          { flexGrow: 1, paddingBottom: insets.bottom + 64 },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={[ds.titleSection, {marginBottom: 20}]}>
          <Text style={ds.subtitle}>
            {userRole ? formatLabel(userRole) : "Member"}
          </Text>
          <Text style={ds.title}>{userName || "User"}</Text>
        </View>

        <DetailRow label="Email" value={profile.email} inline />
        <DetailRow label="Phone" value={profile.phone} inline />
        <DetailRow label="Location" value={profile.location} inline />

        <View style={styles.notificationSection}>
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>All Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleAll}
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
  scrollView: {
    flex: 1,
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
