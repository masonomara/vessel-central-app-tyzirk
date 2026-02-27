import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ViewStyle,
} from "react-native";
import { indexScreenStyles } from "../styles/commonStyles";
import { colors } from "../styles/commonStyles";
import { IconSymbol } from "./IconSymbol";

interface ItemCardProps {
  title: string;
  description: string;
  vesselName: string;
  onPress: () => void;

  isFirst?: boolean;
  isLast?: boolean;
  style?: ViewStyle;

  showCheckbox?: boolean;
  isCompleted?: boolean;
  onComplete?: () => void;

  badge?: {
    label: string;
    fg: string;
    bg: string;
  };

  metaText?: string;

  actions?: React.ReactNode;
}

export const ItemCard = React.memo(
  ({
    title,
    description,
    vesselName,
    onPress,
    isFirst,
    isLast,
    style,
    showCheckbox,
    isCompleted,
    onComplete,
    badge,
    metaText,
    actions,
  }: ItemCardProps) => {
    const handleComplete = useCallback(() => {
      onComplete?.();
    }, [onComplete]);

    return (
      <TouchableOpacity
        style={[
          indexScreenStyles.card,
          isFirst && indexScreenStyles.cardFirst,
          isLast && indexScreenStyles.cardLast,
          style,
        ]}
        onPress={onPress}
      >
        <View style={indexScreenStyles.topRow}>
          {showCheckbox && (
            <Pressable
              style={[
                indexScreenStyles.completeButton,
                {
                  backgroundColor: isCompleted
                    ? colors.greenBackground
                    : "transparent",
                  borderColor: isCompleted
                    ? colors.greenBackground
                    : colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={handleComplete}
              hitSlop={8}
            >
              {isCompleted && (
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check"
                  size={16}
                  color={colors.greenForeground}
                />
              )}
            </Pressable>
          )}

          <Text style={indexScreenStyles.cardTitle} numberOfLines={2}>
            {title}
          </Text>

          {badge && (
            <Text
              style={[
                indexScreenStyles.priorityText,
                { color: badge.fg, backgroundColor: badge.bg },
              ]}
            >
              {badge.label}
            </Text>
          )}
        </View>

        <View
          style={showCheckbox ? indexScreenStyles.bottomRowWithCheckbox : undefined}
        >
          <Text style={indexScreenStyles.cardDescription} numberOfLines={2}>
            {description}
          </Text>
        </View>

        <View
          style={
            showCheckbox
              ? indexScreenStyles.metaRowWithCheckbox
              : indexScreenStyles.metaRow
          }
        >
          <Text style={indexScreenStyles.metaText}>
            {vesselName}
            {metaText ? ` \u2022 ${metaText}` : ""}
          </Text>
        </View>

        {actions}
      </TouchableOpacity>
    );
  },
);
