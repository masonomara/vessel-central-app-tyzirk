import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";

export default function ProfileScreen() {
  const theme = useTheme();
  const { signOut, userName, userRole } = useAuth();
  const router = useRouter();

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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== "ios" && styles.contentContainerWithTabBar,
        ]}
      >
        <GlassView
          style={[
            styles.profileHeader,
            Platform.OS !== "ios" && {
              backgroundColor: theme.dark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
          glassEffectStyle="regular"
        >
          <IconSymbol
            ios_icon_name="person.circle.fill"
            android_material_icon_name="person"
            size={80}
            color={theme.colors.primary}
          />
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {userName || "User"}
          </Text>
          <Text
            style={[styles.email, { color: theme.dark ? "#98989D" : "#666" }]}
          >
            {"user@example.com"}
          </Text>
          {userRole && (
            <View style={[styles.rolePill, { backgroundColor: colors.accent }]}>
              <Text style={styles.roleText}>{userRole.toUpperCase()}</Text>
            </View>
          )}
        </GlassView>

        <GlassView
          style={[
            styles.section,
            Platform.OS !== "ios" && {
              backgroundColor: theme.dark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone"
              size={20}
              color={theme.dark ? "#98989D" : "#666"}
            />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              +1 (555) 123-4567
            </Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location-on"
              size={20}
              color={theme.dark ? "#98989D" : "#666"}
            />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              San Francisco, CA
            </Text>
          </View>
        </GlassView>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Settings
        </Text>

        <GlassView
          style={[
            styles.settingsSection,
            Platform.OS !== "ios" && {
              backgroundColor: theme.dark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
          glassEffectStyle="regular"
        >
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/notification-settings")}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <IconSymbol
                ios_icon_name="bell.fill"
                android_material_icon_name="notifications"
                size={24}
                color={colors.primary}
              />
              <View style={styles.settingItemText}>
                <Text
                  style={[
                    styles.settingItemTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  Notifications
                </Text>
                <Text
                  style={[
                    styles.settingItemDescription,
                    { color: theme.dark ? "#98989D" : "#666" },
                  ]}
                >
                  Manage notification preferences
                </Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={theme.dark ? "#98989D" : "#666"}
            />
          </TouchableOpacity>
        </GlassView>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.danger }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="rectangle.portrait.and.arrow.right"
            android_material_icon_name="logout"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: "center",
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
  },
  rolePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  roleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    gap: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsSection: {
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingItemDescription: {
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
