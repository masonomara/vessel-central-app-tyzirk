import { Stack } from "expo-router";
import { colors } from "../../../styles/commonStyles";
import { Platform } from "react-native";

export default function DocumentsLayout() {
  return (
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
              : colors.surfaceTwo,
        },
      }}
    />
  );
}
