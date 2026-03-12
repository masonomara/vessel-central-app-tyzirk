import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { DataProvider } from "../contexts/DataContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { View, StyleSheet } from "react-native";
import { stackScreenOptions } from "../components/TabStackLayout";
import { colors } from "../styles/commonStyles";
import * as SplashScreen from "expo-splash-screen";

const headerWithBg = {
  headerStyle: { backgroundColor: colors.surfaceOne },
};

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  return (
    <View style={styles.container}>
      <Stack screenOptions={stackScreenOptions}>
        {/* Auth screens — no header */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="user-login" options={{ headerShown: false }} />
        <Stack.Screen
          name="operation-member-setup"
          options={{ title: "Create an Account", ...headerWithBg }}
        />

        {/* Tabs — header handled by NativeTabs */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, headerBackTitle: "Back" }}
        />

        {/* Add-form modals */}
        <Stack.Screen
          name="add-calendar-event"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Event",
            ...headerWithBg,
          }}
        />
        <Stack.Screen
          name="add-certification"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Certification",
            ...headerWithBg,
          }}
        />
        <Stack.Screen
          name="add-charter"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Log Charter",
            ...headerWithBg,
          }}
        />
        <Stack.Screen
          name="add-contact"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Contact",
            ...headerWithBg,
          }}
        />
        <Stack.Screen
          name="add-document"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Upload Document",
            ...headerWithBg,
          }}
        />
        <Stack.Screen
          name="add-equipment"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Equipment",
            ...headerWithBg,
          }}
        />
        <Stack.Screen
          name="add-issue"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Report Issue",
            ...headerWithBg,
          }}
        />
        <Stack.Screen
          name="add-maintenance-task"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Maintenance Task",
            ...headerWithBg,
          }}
        />
        <Stack.Screen
          name="add-parts-request"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Request Parts",
            ...headerWithBg,
          }}
        />
        <Stack.Screen
          name="add-supply-request"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Request Supplies",
            ...headerWithBg,
          }}
        />

        {/* Analytics */}
        <Stack.Screen name="boat-analytics" options={{ title: "Analytics", ...headerWithBg }} />

        {/* Detail screens */}
        <Stack.Screen
          name="detail-calendar-event"
          options={{ title: "Event Details", ...headerWithBg }}
        />
        <Stack.Screen
          name="detail-certification"
          options={{ title: "Certification", ...headerWithBg }}
        />
        <Stack.Screen
          name="detail-charter"
          options={{ title: "Charter Details", ...headerWithBg }}
        />
        <Stack.Screen name="detail-contact" options={{ title: "Contact", ...headerWithBg }} />
        <Stack.Screen name="detail-document" options={{ title: "Document", ...headerWithBg }} />
        <Stack.Screen name="detail-equipment" options={{ title: "Equipment", ...headerWithBg }} />
        <Stack.Screen
          name="detail-issue"
          options={{ title: "Issue Details", ...headerWithBg }}
        />
        <Stack.Screen name="detail-maintenance" options={{ title: "", ...headerWithBg }} />
        <Stack.Screen
          name="detail-supply"
          options={{ title: "Supply Request", ...headerWithBg }}
        />
        <Stack.Screen
          name="detail-vessel"
          options={{ title: "Vessel Details", headerBackTitle: "Back", ...headerWithBg }}
        />

        {/* Operation screens */}
      
        <Stack.Screen
          name="operation-update-engine-hours"
          options={{ title: "Update Engine Hours", ...headerWithBg }}
        />

        {/* Profile */}
        <Stack.Screen
          name="user-profile"
          options={{ title: "Profile", headerBackTitle: "Back", ...headerWithBg }}
        />
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
