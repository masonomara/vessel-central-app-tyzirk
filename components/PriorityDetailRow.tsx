import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router, Href } from "expo-router";
import { colors } from "../styles/commonStyles";
import { IconSymbol } from "./IconSymbol";
import { PressableCard } from "./PressableCard";

interface DetailItem {
  label: string;
  value: string;
  valueColor?: string;
  linkTo?: { pathname: string; params: Record<string, string> };
  icon?: {
    ios_icon_name: string;
    android_material_icon_name: string;
  };
}

interface PriorityDetailRowProps {
  items: [DetailItem, DetailItem];
}

function DetailCell({ label, value, valueColor, linkTo, icon }: DetailItem) {
  const content = (
    <View style={styles.cell}>
      {icon && (
        <IconSymbol
          ios_icon_name={icon.ios_icon_name}
          android_material_icon_name={icon.android_material_icon_name}
          size={16}
          color={colors.textSecondary}
          style={styles.icon}
        />
      )}
      <View style={styles.cellContent}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          <Text
            style={[
              styles.value,
              valueColor ? { color: valueColor } : undefined,
            ]}
            numberOfLines={2}
          >
            {value}
          </Text>
        </View>
      </View>
    </View>
  );

  if (linkTo) {
    return (
      <PressableCard
        variant="ghost"
        onPress={() => router.push(linkTo as Href)}
        style={styles.cellWrapper}
      >
        {content}
      </PressableCard>
    );
  }

  return <View style={styles.cellWrapper}>{content}</View>;
}

export function PriorityDetailRow({ items }: PriorityDetailRowProps) {
  return (
    <View style={styles.row}>
      <DetailCell {...items[0]} />
      <DetailCell {...items[1]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 0,
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 24,
    paddingTop: 20,
  },
  cellWrapper: {
    flex: 1,
  },
  cell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    backgroundColor: colors.surfaceOne,
    padding: 8,
    borderRadius: 100,
  },
  cellContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: "400",
    lineHeight: 16,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
    lineHeight: 19,
  },
  valueLinked: {
    color: colors.accent,
  },
  divider: {
    width: 1,
    backgroundColor: colors.borderSoft,
    marginHorizontal: 16,
  },
});
