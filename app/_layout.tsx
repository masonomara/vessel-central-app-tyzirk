import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { DataProvider } from "../contexts/DataContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { View, StyleSheet } from "react-native";
import { stackScreenOptions } from "../components/TabStackLayout";
import * as SplashScreen from "expo-splash-screen";

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
          options={{ headerShown: false }}
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
          }}
        />
        <Stack.Screen
          name="add-certification"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Certification",
          }}
        />
        <Stack.Screen
          name="add-charter"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Log Charter",
          }}
        />
        <Stack.Screen
          name="add-contact"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Contact",
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
          name="add-equipment"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Equipment",
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
          name="add-maintenance-task"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Maintenance Task",
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
        <Stack.Screen
          name="add-supply-request"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Request Supplies",
          }}
        />

        {/* Analytics */}
        <Stack.Screen name="boat-analytics" options={{ title: "Analytics" }} />

        {/* Detail screens */}
        <Stack.Screen
          name="detail-calendar-event"
          options={{ title: "Event Details" }}
        />
        <Stack.Screen
          name="detail-certification"
          options={{ title: "Certification" }}
        />
        <Stack.Screen
          name="detail-charter"
          options={{ title: "Charter Details" }}
        />
        <Stack.Screen name="detail-contact" options={{ title: "Contact" }} />
        <Stack.Screen name="detail-document" options={{ title: "Document" }} />
        <Stack.Screen name="detail-equipment" options={{ title: "Equipment" }} />
        <Stack.Screen
          name="detail-issue"
          options={{ title: "Issue Details" }}
        />
        <Stack.Screen name="detail-maintenance" options={{ title: "" }} />
        <Stack.Screen
          name="detail-supply"
          options={{ title: "Supply Request" }}
        />
        <Stack.Screen
          name="detail-vessel"
          options={{ title: "Vessel Details", headerBackTitle: "Back" }}
        />

        {/* Operation screens */}
        <Stack.Screen
          name="operation-assign-boats"
          options={{ title: "Assign Boats" }}
        />
        <Stack.Screen
          name="operation-update-engine-hours"
          options={{ title: "Update Engine Hours" }}
        />

        {/* Profile */}
        <Stack.Screen
          name="user-profile"
          options={{ title: "Profile", headerBackTitle: "Back" }}
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
