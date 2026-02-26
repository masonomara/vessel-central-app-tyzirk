import React from "react";
import { TextInput, View } from "react-native";
import { IconSymbol } from "./IconSymbol";
import { colors, indexScreenStyles } from "../styles/commonStyles";

type Props = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
};

export const SearchBar = React.memo(({ placeholder, value, onChangeText }: Props) => (
  <View style={indexScreenStyles.searchContainer}>
    <IconSymbol
      ios_icon_name="magnifyingglass"
      android_material_icon_name="search"
      size={20}
      color={colors.textSecondary}
    />
    <TextInput
      style={indexScreenStyles.searchInput}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
));
