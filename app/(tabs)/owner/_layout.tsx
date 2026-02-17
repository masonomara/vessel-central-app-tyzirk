import { Stack } from "expo-router";
import { colors } from "@/styles/commonStyles";

export default function OwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
      }}
    />
  );
}
