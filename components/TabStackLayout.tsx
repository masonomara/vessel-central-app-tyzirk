import { Stack } from "expo-router";
import { colors } from "../styles/commonStyles";

export const stackScreenOptions = {
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: "600" as const },
  headerShadowVisible: false,
};

export default function TabStackLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
