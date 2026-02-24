import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../styles/commonStyles";

export interface ChipOption {
  label: string;
  value: string;
  color?: string;
}

interface ChipRowProps {
  label?: string;
  options: ChipOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function ChipRow({
  label,
  options,
  selectedValue,
  onSelect,
}: ChipRowProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.chipRow}>
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
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
                if (!isSelected) onSelect(option.value);
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 13,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
