import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { DataProvider } from "../contexts/DataContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { View, StyleSheet, Platform } from "react-native";
import { colors } from "../styles/commonStyles";

function RootLayoutContent() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerTransparent:
            Platform.OS === "ios" && Number(Platform.Version) >= 26,
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "600" },
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor:
              Platform.OS === "ios" && Number(Platform.Version) >= 26
                ? "transparent"
                : colors.surfaceOne,
          },
        }}
      >
        {/* Auth screens — no header */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />

        {/* Tabs — header handled by NativeTabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Add-form modals */}
        <Stack.Screen
          name="add-maintenance-task"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Maintenance Task",
          }}
        />
        <Stack.Screen
          name="add-issue"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Report Issue",
          }}
        />
        <Stack.Screen
          name="add-document"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Upload Document",
          }}
        />
        <Stack.Screen
          name="add-calendar-event"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Event",
          }}
        />
        <Stack.Screen
          name="add-supply-request"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Request Supplies",
          }}
        />
        <Stack.Screen
          name="add-parts-request"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Request Parts",
          }}
        />

        {/* Detail screens */}
        <Stack.Screen
          name="maintenance-detail"
          options={{ title: "" }}
        />
        <Stack.Screen
          name="issue-detail"
          options={{ title: "Issue Details" }}
        />
        <Stack.Screen
          name="supply-detail"
          options={{ title: "Supply Request" }}
        />
        <Stack.Screen name="document-detail" options={{ title: "Document" }} />
        <Stack.Screen
          name="calendar-event-detail"
          options={{ title: "Event Details" }}
        />
        <Stack.Screen
          name="vessel-detail"
          options={{ title: "Vessel Details", headerBackTitle: "Back" }}
        />

        {/* Profile — pushed from headerRight button */}
        <Stack.Screen name="profile" options={{ title: "Profile" }} />

        {/* Utility screens */}
        <Stack.Screen name="assign-boats" options={{ title: "Assign Boats" }} />
        <Stack.Screen name="manager-login" options={{ headerShown: false }} />
        <Stack.Screen
          name="notification-settings"
          options={{ title: "Notification Settings" }}
        />
        <Stack.Screen name="analytics" options={{ title: "Analytics" }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <RootLayoutContent />
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
