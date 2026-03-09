import React, { useState } from "react";
import { StyleSheet, Pressable, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, spacing } from "../styles/commonStyles";

interface PressableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  variant?: "card" | "ghost";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableCard({
  children,
  onPress,
  style,
  hapticFeedback = true,
  variant = "card",
}: PressableCardProps) {
  const scale = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    setIsPressed(true);
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    setIsPressed(false);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[variant !== "ghost" && styles.container, animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    padding: 16,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceOne,
  },
  gradient: {
    padding: spacing.lg,
  },
});
