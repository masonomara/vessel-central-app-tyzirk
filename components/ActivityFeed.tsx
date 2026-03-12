
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import { ListItemCard } from './ListItemCard';
import { GroupedListContainer } from './GroupedListContainer';

interface ActivityFeedProps {
  userId?: string;
  limit?: number;
  showUnreadOnly?: boolean;
  onItemPress?: (type: string, id: string) => void;
}

const allEvents = [
  {
    type: 'issue',
    id: '1',
    title: 'New Issue Reported',
    description: 'Marcus Rivera reported Port Navigation Light Intermittent on Purely Blu',
    vesselName: 'Purely Blu',
    time: '2 hours ago',
    icon: { iosName: 'exclamationmark.triangle.fill', androidName: 'warning' },
  },
  {
    type: 'supply',
    id: '2',
    title: 'Supply Request Approved',
    description: 'Saildrive Seal Kit approved for Purely Blu',
    vesselName: 'Purely Blu',
    time: '12 hours ago',
    icon: { iosName: 'checkmark.circle.fill', androidName: 'check-circle' },
  },
  {
    type: 'maintenance',
    id: '1',
    title: 'Task Completed',
    description: 'Navigation system maintenance completed on Ocean Pearl',
    vesselName: 'Ocean Pearl',
    time: '1 day ago',
    icon: { iosName: 'checkmark.circle.fill', androidName: 'check-circle' },
  },
  {
    type: 'maintenance',
    id: '2',
    title: 'Maintenance Updated',
    description: 'Safety Equipment Check status changed to In Progress',
    vesselName: '',
    time: '2 days ago',
    icon: { iosName: 'wrench.fill', androidName: 'build' },
  },
  {
    type: 'maintenance',
    id: '3',
    title: 'Task Assigned',
    description: 'Teak Cockpit Table Refinish assigned to Marcus Rivera on Purely Blu',
    vesselName: 'Purely Blu',
    time: '3 days ago',
    icon: { iosName: 'person.fill.checkmark', androidName: 'assignment' },
  },
];

export function ActivityFeed({ limit = 20, onItemPress }: ActivityFeedProps) {
  const events = allEvents.slice(0, limit);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Activity Feed</Text>
        <Text style={styles.sectionCount}>
          {events.length} {events.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {events.length > 0 ? (
        <GroupedListContainer>
          {events.map((event, index) => (
            <ListItemCard
              key={`${event.type}-${event.id}`}
              title={event.title}
              description={event.description}
              vesselName={event.vesselName}
              onPress={() => onItemPress?.(event.type, event.id)}
              isFirst={index === 0}
              isLast={index === events.length - 1}
              icon={event.icon}
              metaText={event.time}
              inContainer={true}
              style={{ marginLeft: 0, backgroundColor: 'transparent' }}
            />
          ))}
        </GroupedListContainer>
      ) : (
        <Text style={styles.emptyText}>No recent activity</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceOne,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.text,
  },
  sectionCount: {
    fontSize: 15,
    color: colors.textTertiary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
});
