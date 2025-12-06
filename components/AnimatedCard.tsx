
import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  animationType?: 'fade' | 'slide' | 'scale';
}

export function AnimatedCard({ 
  children, 
  delay = 0, 
  style,
  animationType = 'fade'
}: AnimatedCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      
      if (animationType === 'slide' || animationType === 'fade') {
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 100,
        });
      }
      
      if (animationType === 'scale') {
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 100,
        });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, animationType]);

  const animatedStyle = useAnimatedStyle(() => {
    if (animationType === 'scale') {
      return {
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
      };
    }
    
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
