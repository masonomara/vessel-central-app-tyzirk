import { Stack } from "expo-router";
import { Platform } from "react-native";
import { colors } from "../../../styles/commonStyles";

export default function CalendarLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent:
          Platform.OS === "ios" && Number(Platform.Version) >= 26,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Platform.OS === "ios" && Number(Platform.Version) >= 26
            ? "transparent"
            : colors.surfaceOne },
      }}
    />
  );
}
