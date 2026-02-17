
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { PressableCard } from './PressableCard';

interface RealtimeFeedProps {
  userId?: string;
  limit?: number;
  showUnreadOnly?: boolean;
  onItemPress?: (type: string, id: string) => void;
}

export function RealtimeFeed({ limit = 20, onItemPress }: RealtimeFeedProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Feed</Text>
      </View>

      <View style={styles.listContent}>
        <PressableCard style={styles.eventCard} onPress={() => onItemPress?.('issue', '1')}>
          <View style={[styles.eventIcon, { backgroundColor: colors.danger + '20' }]}>
            <IconSymbol ios_icon_name="exclamationmark.triangle.fill" android_material_icon_name="warning" size={24} color={colors.danger} />
          </View>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>New Issue Reported</Text>
            <Text style={styles.eventDescription} numberOfLines={2}>Mike Davis reported Deck Leak on Azure Dream</Text>
            <Text style={styles.eventTime}>2 hours ago</Text>
          </View>
        </PressableCard>

        <PressableCard style={styles.eventCard} onPress={() => onItemPress?.('supply', '2')}>
          <View style={[styles.eventIcon, { backgroundColor: colors.success + '20' }]}>
            <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check-circle" size={24} color={colors.success} />
          </View>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>Supply Request Approved</Text>
            <Text style={styles.eventDescription} numberOfLines={2}>Engine Oil request approved for Azure Dream</Text>
            <Text style={styles.eventTime}>12 hours ago</Text>
          </View>
        </PressableCard>

        {limit > 2 && (
          <PressableCard style={styles.eventCard} onPress={() => onItemPress?.('maintenance', '1')}>
            <View style={[styles.eventIcon, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check-circle" size={24} color={colors.success} />
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>Task Completed</Text>
              <Text style={styles.eventDescription} numberOfLines={2}>Navigation system maintenance completed on Ocean Pearl</Text>
              <Text style={styles.eventTime}>1 day ago</Text>
            </View>
          </PressableCard>
        )}

        {limit > 3 && (
          <PressableCard style={styles.eventCard} onPress={() => onItemPress?.('maintenance', '2')}>
            <View style={[styles.eventIcon, { backgroundColor: colors.warning + '20' }]}>
              <IconSymbol ios_icon_name="wrench.fill" android_material_icon_name="build" size={24} color={colors.warning} />
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>Maintenance Updated</Text>
              <Text style={styles.eventDescription} numberOfLines={2}>Safety Equipment Check status changed to In Progress</Text>
              <Text style={styles.eventTime}>2 days ago</Text>
            </View>
          </PressableCard>
        )}

        {limit > 4 && (
          <PressableCard style={styles.eventCard} onPress={() => onItemPress?.('maintenance', '3')}>
            <View style={[styles.eventIcon, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol ios_icon_name="person.fill.checkmark" android_material_icon_name="assignment" size={24} color={colors.accent} />
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>Task Assigned</Text>
              <Text style={styles.eventDescription} numberOfLines={2}>Deck Cleaning assigned to Mike Davis on Azure Dream</Text>
              <Text style={styles.eventTime}>3 days ago</Text>
            </View>
          </PressableCard>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  listContent: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
