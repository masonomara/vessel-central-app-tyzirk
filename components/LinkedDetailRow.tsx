import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router, Href } from "expo-router";
import { colors } from "../styles/commonStyles";
import { IconSymbol } from "./IconSymbol";
import { PressableCard } from "./PressableCard";

interface LinkedDetailRowProps {
  label: string;
  value: string;
  linkTo?: { pathname: string; params: Record<string, string> };
}

export function LinkedDetailRow({
  label,
  value,
  linkTo,
}: LinkedDetailRowProps) {
  const content = (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, linkTo && styles.valueLinked]}>
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
    </View>
  );

  if (linkTo) {
    return (
      <PressableCard variant="ghost" onPress={() => router.push(linkTo as Href)}>
        {content}
      </PressableCard>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  label: { fontSize: 14, color: colors.textTertiary },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  value: { fontSize: 14, color: colors.text, fontWeight: "500" },
  valueLinked: { color: colors.accent },
});
