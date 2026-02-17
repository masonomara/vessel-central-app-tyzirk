import { Stack } from "expo-router";
import { colors } from "../../../styles/commonStyles";

export default function CrewLayout() {
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
