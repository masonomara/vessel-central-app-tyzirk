
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients, spacing } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  androidIcon?: string;
  gradientColors?: string[];
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'accent' | 'gold' | 'success' | 'warning' | 'danger';
}

export function GradientButton({
  title,
  onPress,
  icon,
  androidIcon,
  gradientColors,
  style,
  textStyle,
  disabled = false,
  variant = 'accent',
}: GradientButtonProps) {
  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const getGradientColors = (): readonly [string, string] => {
    if (gradientColors && gradientColors.length >= 2) return [gradientColors[0], gradientColors[1]];
    if (disabled) return [colors.textMuted, colors.textMuted];

    switch (variant) {
      case 'primary':
        return gradients.primary;
      case 'gold':
        return gradients.gold;
      case 'success':
        return gradients.success;
      case 'warning':
        return gradients.warning;
      case 'danger':
        return gradients.danger;
      default:
        return gradients.accent;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {icon && androidIcon && (
          <IconSymbol
            ios_icon_name={icon}
            android_material_icon_name={androidIcon}
            size={20}
            color={colors.text}
          />
        )}
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});
