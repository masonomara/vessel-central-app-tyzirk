
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '@/styles/commonStyles';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  useGradient?: boolean;
}

export function GlassCard({ 
  children, 
  style, 
  intensity = 20,
  tint = 'dark',
  useGradient = true,
}: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      {useGradient && (
        <LinearGradient
          colors={[colors.glass, colors.card + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <BlurView intensity={intensity} tint={tint} style={styles.blur}>
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    backgroundColor: colors.glass,
    padding: spacing.xl,
  },
});
