import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";

export function ProfileHeaderButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push("/profile")}>
      <IconSymbol
        android_material_icon_name="account-circle"
        size={28}
        color={colors.text}
      />
    </TouchableOpacity>
  );
}
