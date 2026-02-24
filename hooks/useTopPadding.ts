import { Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useTopPadding(): number {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  return Math.max(
    insets.top,
    Number(Platform.Version) >= 26 ? headerHeight + 18 : 0,
  );
}
