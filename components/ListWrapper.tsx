import React from "react";
import { View, ViewStyle } from "react-native";
import { colors } from "../styles/commonStyles";

interface ListWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ListWrapper({ children, style }: ListWrapperProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.container,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.borderSoft,
          marginHorizontal: 20,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
