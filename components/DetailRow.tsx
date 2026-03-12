import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router, Href } from "expo-router";
import { colors } from "../styles/commonStyles";
import { IconSymbol } from "./IconSymbol";
import { PressableCard } from "./PressableCard";

interface ChipOption {
  label: string;
  value: string;
  color?: string;
}

interface DetailRowBaseProps {
  label?: string;
  inline?: boolean;
  valueColor?: string;
  linkTo?: { pathname: string; params: Record<string, string> };
}

interface DetailRowWithValue extends DetailRowBaseProps {
  value: string;
  button?: never;
  chips?: never;
}

interface DetailRowWithButton extends DetailRowBaseProps {
  value?: string;
  button: {
    label: string;
    onPress: () => void;
    color?: string;
    variant?: "danger";
  };
  chips?: never;
}

interface DetailRowWithChips extends DetailRowBaseProps {
  value?: never;
  button?: never;
  chips: {
    options: ChipOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
  };
}

type DetailRowProps =
  | DetailRowWithValue
  | DetailRowWithButton
  | DetailRowWithChips;

export function DetailRow({
  label,
  inline,
  value,
  valueColor,
  linkTo,
  button,
  chips,
}: DetailRowProps) {
  const content = (
    <View
      style={[
        styles.row,
        !label && styles.rowNoBorder,
        (inline || button) && styles.rowInline,
      ]}
    >
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {chips ? (
        <View style={styles.chipRow}>
          {chips.options.map((option) => {
            const isSelected = option.value === chips.selectedValue;
            const chipColor = option.color || colors.accent;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chip,
                  isSelected
                    ? {
                        backgroundColor: chipColor + "20",
                        borderColor: chipColor,
                      }
                    : {
                        backgroundColor: "transparent",
                        borderColor: colors.borderSoft,
                      },
                ]}
                onPress={() => {
                  if (!isSelected) chips.onSelect(option.value);
                }}
                activeOpacity={isSelected ? 1 : 0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? chipColor : colors.textSecondary },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : button ? (
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                button.variant === "danger"
                  ? colors.danger
                  : button.color || colors.accent,
            },
          ]}
          onPress={button.onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{button.label}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.valueRow}>
          <Text
            style={[
              styles.value,
              inline && styles.valueInline,
              valueColor ? { color: valueColor } : undefined,
              linkTo && styles.valueLinked,
            ]}
            numberOfLines={2}
          >
            {value}
          </Text>
          {linkTo && (
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={16}
              color={colors.accent}
            />
          )}
        </View>
      )}
    </View>
  );

  if (linkTo && !button && !chips) {
    return (
      <PressableCard
        variant="ghost"
        onPress={() => router.push(linkTo as Href)}
      >
        {content}
      </PressableCard>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "column",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceOne,
  },
  rowNoBorder: {
    borderTopWidth: 0,
    paddingTop: 0,
    backgroundColor: colors.surfaceOne,
  },
  rowInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontSize: 16, color: colors.text, fontWeight: "600" },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  value: { fontSize: 15, color: colors.text, marginTop: 13 },
  valueInline: { marginTop: 0, textAlign: "right" },
  valueLinked: { color: colors.accent },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: -12,
    marginBottom: -12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 13,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
