
import React, { memo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface StatCardProps {
  icon: string;
  androidIcon: string;
  iconColor: string;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onPress?: () => void;
  backgroundColor?: string;
  useGradient?: boolean;
}

export const StatCard = memo(function StatCard({
  icon,
  androidIcon,
  iconColor,
  label,
  value,
  subtext,
  trend,
  trendValue,
  onPress,
  backgroundColor = colors.card,
  useGradient = false,
}: StatCardProps) {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const content = (
    <View style={styles.contentWrapper}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
          <IconSymbol 
            ios_icon_name={icon} 
            android_material_icon_name={androidIcon} 
            size={24} 
            color={iconColor} 
          />
        </View>
        {trend && trendValue && (
          <View style={[
            styles.trendBadge,
            trend === 'up' ? styles.trendUp : trend === 'down' ? styles.trendDown : styles.trendNeutral
          ]}>
            <IconSymbol 
              ios_icon_name={trend === 'up' ? 'arrow.up' : trend === 'down' ? 'arrow.down' : 'minus'} 
              android_material_icon_name={trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'remove'} 
              size={12} 
              color={trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.textSecondary} 
            />
            <Text style={[
              styles.trendText,
              trend === 'up' ? styles.trendTextUp : trend === 'down' ? styles.trendTextDown : styles.trendTextNeutral
            ]}>{trendValue}</Text>
          </View>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        style={styles.wrapper} 
        onPress={handlePress} 
        activeOpacity={0.8}
      >
        {useGradient ? (
          <LinearGradient
            colors={[colors.card, colors.cardElevated]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
          >
            {content}
          </LinearGradient>
        ) : (
          <View style={[styles.container, { backgroundColor }]}>
            {content}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.wrapper}>
      {useGradient ? (
        <LinearGradient
          colors={[colors.card, colors.cardElevated]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.container, { backgroundColor }]}>
          {content}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: '47%',
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  contentWrapper: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  trendUp: {
    backgroundColor: colors.success + '20',
  },
  trendDown: {
    backgroundColor: colors.danger + '20',
  },
  trendNeutral: {
    backgroundColor: colors.textSecondary + '20',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trendTextUp: {
    color: colors.success,
  },
  trendTextDown: {
    color: colors.danger,
  },
  trendTextNeutral: {
    color: colors.textSecondary,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});
