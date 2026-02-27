import { Stack } from "expo-router";
import { Platform } from "react-native";
import { colors } from "../styles/commonStyles";

const isIOS26 = Platform.OS === "ios" && Number(Platform.Version) >= 26;

export const stackScreenOptions = {
  headerTransparent: isIOS26,
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: "600" as const },
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: isIOS26 ? "transparent" : colors.surfaceOne,
  },
};

export default function TabStackLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
