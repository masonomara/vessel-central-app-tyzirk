
import React, { memo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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
}: StatCardProps) {
  const content = (
    <View style={[styles.container, { backgroundColor }]}>
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
      <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.wrapper}>{content}</View>;
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: '47%',
  },
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 140,
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
  },
  subtext: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});
