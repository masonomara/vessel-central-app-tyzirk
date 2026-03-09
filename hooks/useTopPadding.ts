import { Platform } from "react-native";

export const scrollProps =
  Platform.OS === "ios" && Number(Platform.Version) >= 26
    ? {
        contentInsetAdjustmentBehavior: "automatic" as const,
        automaticallyAdjustsScrollIndicatorInsets: true,
      }
    : {};
