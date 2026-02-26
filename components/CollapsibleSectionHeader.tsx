import React from "react";
import { Pressable, Text } from "react-native";
import { IconSymbol } from "./IconSymbol";
import { colors, indexScreenStyles } from "../styles/commonStyles";

type Props = {
  title: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
};

export const CollapsibleSectionHeader = React.memo(
  ({ title, count, collapsed, onToggle }: Props) => (
    <Pressable style={indexScreenStyles.sectionHeaderRow} onPress={onToggle}>
      <IconSymbol
        ios_icon_name={collapsed ? "chevron.right" : "chevron.down"}
        android_material_icon_name={collapsed ? "chevron-right" : "expand-more"}
        size={16}
        color={colors.textSecondary}
        style={indexScreenStyles.dropdown}
      />
      <Text style={indexScreenStyles.sectionHeader}>{title}</Text>
      <Text style={indexScreenStyles.sectionCount}>
        {" "}
        {count} items
      </Text>
    </Pressable>
  ),
);
