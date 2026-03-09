import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { indexScreenStyles } from "../styles/commonStyles";

type Props = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  labelForAll?: string;
};

export const FilterRow = React.memo(
  ({ options, selected, onSelect, labelForAll = "All" }: Props) => (
    <View style={indexScreenStyles.filterContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={options}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              indexScreenStyles.filterChip,
              selected === item && indexScreenStyles.filterChipActive,
            ]}
            onPress={() => onSelect(item)}
          >
            <Text
              style={[
                indexScreenStyles.filterChipText,
                selected === item && indexScreenStyles.filterChipTextActive,
              ]}
            >
              {item === "all" ? labelForAll : item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={indexScreenStyles.filterContent}
      />
    </View>
  ),
);
