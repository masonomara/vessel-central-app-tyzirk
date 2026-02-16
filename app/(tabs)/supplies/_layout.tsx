import { Stack } from "expo-router";
import { colors } from "@/styles/commonStyles";

export default function SuppliesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
      }}
    />
  );
}
