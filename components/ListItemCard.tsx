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

interface ListItemCardProps {
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

  icon?: {
    iosName: string;
    androidName: string;
  };

  badge?: {
    label: string;
    fg: string;
    bg: string;
  };

  metaText?: string;
  secondaryMetaText?: string;
  bordered?: boolean;

  actions?: React.ReactNode;
  inContainer?: boolean;
}

export const ListItemCard = React.memo(
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
    icon,
    badge,
    metaText,
    secondaryMetaText,
    bordered,
    actions,
    inContainer,
  }: ListItemCardProps) => {
    const handleComplete = useCallback(() => {
      onComplete?.();
    }, [onComplete]);

    return (
      <TouchableOpacity
        style={[
          indexScreenStyles.card,
          !showCheckbox && !icon && { paddingLeft: 20 },
          isFirst && indexScreenStyles.cardFirst,
          isLast && indexScreenStyles.cardLast,
          bordered && {
            borderWidth: 1,
            borderColor: colors.borderSoft,
            borderRadius: 12,
            marginHorizontal: 20,
            marginLeft: 20,
            paddingLeft: 0,
            paddingRight: 16,
            paddingBottom: 12,
          },
          inContainer && {
            paddingLeft: 0,
            paddingRight: 16,
            marginLeft: 0,
            backgroundColor: "transparent",
          },
          style,
        ]}
        onPress={onPress}
      >
        {!isFirst && !bordered && (
          <View
            style={{
              height: 1,
              backgroundColor: colors.borderSoft,
              marginLeft: showCheckbox || icon ? 60 : 0,
              marginRight: -60,
            }}
          />
        )}
        <View style={indexScreenStyles.topRow}>
          {showCheckbox && (
            <Pressable
              style={[
                indexScreenStyles.completeButton,
                {
                  backgroundColor: isCompleted
                    ? colors.greenForeground
                    : "transparent",
                  borderColor: isCompleted
                    ? colors.greenForeground
                    : colors.border,
                  borderWidth: 1,
                },
                inContainer && {
                  marginLeft: 16,
                },
              ]}
              onPress={handleComplete}
              hitSlop={8}
            >
              {isCompleted ? (
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check"
                  size={16}
                  color={colors.container}
                />
              ) : (
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check"
                  size={16}
                  color={colors.textTertiary}
                />
              )}
            </Pressable>
          )}

          {!showCheckbox && icon && (
            <View
              style={[
                indexScreenStyles.iconHolder,
                inContainer && {
                  marginLeft: 16,
                  paddingLeft: 0,
                },
              ]}
            >
              <IconSymbol
                ios_icon_name={icon.iosName}
                android_material_icon_name={icon.androidName}
                size={16}
                color={colors.textSecondary}
              />
            </View>
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
          style={[
            showCheckbox || icon
              ? indexScreenStyles.bottomRowWithCheckbox
              : undefined,
            inContainer && {
              marginLeft: -4,
            },
          ]}
        >
          <Text style={indexScreenStyles.cardDescription} numberOfLines={2}>
            {description}
          </Text>
        </View>

        <View
          style={[
            showCheckbox || icon
              ? indexScreenStyles.metaRowWithCheckbox
              : indexScreenStyles.metaRow,
            inContainer && {
              marginLeft: 57,
            },
          ]}
        >
          <Text style={indexScreenStyles.metaText}>
            {vesselName}
            {metaText ? ` \u2022 ${metaText}` : ""}
          </Text>
        </View>

        {secondaryMetaText ? (
          <View
            style={
              showCheckbox || icon
                ? indexScreenStyles.metaRowWithCheckbox
                : indexScreenStyles.metaRow
            }
          >
            <Text style={[indexScreenStyles.metaText, { marginTop: 0 }]}>
              {secondaryMetaText}
            </Text>
          </View>
        ) : null}

        {actions ? (
          <View
            style={
              showCheckbox || icon
                ? indexScreenStyles.bottomRowWithCheckbox
                : undefined
            }
          >
            {actions}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  },
);
