import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { colors } from "../styles/commonStyles";
import { IconSymbol } from "./IconSymbol";

const red = { fg: colors.redForeground, bg: colors.redBackground };
const orange = { fg: colors.orangeForeground, bg: colors.orangeBackground };
const yellow = { fg: colors.yellowForeground, bg: colors.yellowBackground };
const green = { fg: colors.greenForeground, bg: colors.greenBackground };
const blue = { fg: colors.blueForeground, bg: colors.blueBackground };
const neutral = { fg: colors.textSecondary, bg: colors.surfaceThree };

const valueColors: Record<string, { fg: string; bg: string }> = {
  // priority
  urgent: red,
  high: red,
  medium: orange,
  low: yellow,
  // status
  completed: green,
  cancelled: red,
  denied: red,
  in_progress: neutral,
  open: neutral,
  waiting_on_parts: orange,
  scheduled: neutral,
  pending: blue,
  approved: blue,
  ordered: blue,
  received: green,
  // categories (neutral)
  maintenance: neutral,
  charter: neutral,
  inspection: neutral,
  crew_change: neutral,
  provisioning: neutral,
  meeting: neutral,
  other: neutral,
  manual: neutral,
  insurance: neutral,
  registration: neutral,
  safety: neutral,
  warranty: neutral,
  invoice: neutral,
  receipt: neutral,
};

const defaultColor = neutral;

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownRowProps {
  label: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function DropdownRow({
  label,
  options,
  selectedValue,
  onSelect,
}: DropdownRowProps) {
  const selectedOption = options.find((o) => o.value === selectedValue);

  const handlePress = () => {
    if (Platform.OS === "ios") {
      const labels = [...options.map((o) => o.label), "Cancel"];
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: labels,
          cancelButtonIndex: labels.length - 1,
        },
        (buttonIndex) => {
          if (buttonIndex < options.length) {
            const picked = options[buttonIndex];
            if (picked.value !== selectedValue) {
              onSelect(picked.value);
            }
          }
        },
      );
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectorText,
            {
              color: (valueColors[selectedValue] || defaultColor).fg,
              backgroundColor: (valueColors[selectedValue] || defaultColor).bg,
            },
          ]}
        >
          {selectedOption?.label ?? selectedValue}
        </Text>
        <IconSymbol
          ios_icon_name="chevron.down"
          android_material_icon_name="keyboard-arrow-down"
          size={14}
          color={colors.textTertiary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
    paddingVertical: 16,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: -10,
  },
  selectorText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
    borderRadius: 4,
    padding: 6,
    paddingVertical: 0,
    lineHeight: 24,
  },
});
