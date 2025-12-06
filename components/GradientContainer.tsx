
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing } from '@/styles/commonStyles';

interface GradientContainerProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'gold' | 'success' | 'warning' | 'danger' | 'card' | 'subtle';
  style?: ViewStyle;
  colors?: string[];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
}

export function GradientContainer({
  children,
  variant = 'card',
  style,
  colors: customColors,
  startPoint = { x: 0, y: 0 },
  endPoint = { x: 1, y: 1 },
}: GradientContainerProps) {
  const getGradientColors = () => {
    if (customColors) return customColors;
    
    switch (variant) {
      case 'primary':
        return gradients.primary;
      case 'accent':
        return gradients.accent;
      case 'gold':
        return gradients.gold;
      case 'success':
        return gradients.success;
      case 'warning':
        return gradients.warning;
      case 'danger':
        return gradients.danger;
      case 'subtle':
        return gradients.subtle;
      default:
        return gradients.card;
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={startPoint}
      end={endPoint}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: spacing.lg,
  },
});
