import { Platform } from "react-native";

export const scrollProps =
  Platform.OS === "ios"
    ? {
        contentInsetAdjustmentBehavior: "automatic" as const,
        automaticallyAdjustsScrollIndicatorInsets: true,
      }
    : {};
