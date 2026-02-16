
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRealtime } from '@/hooks/useRealtime';
import { RealtimeEvent } from '@/utils/realtimeManager';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { formatDate } from '@/utils/dateUtils';

interface RealtimeFeedProps {
  userId?: string;
  limit?: number;
  showUnreadOnly?: boolean;
}

const EVENT_ICONS: Record<string, { ios: string; android: string; color: string }> = {
  maintenance_updated: {
    ios: 'wrench.fill',
    android: 'build',
    color: colors.warning,
  },
  issue_created: {
    ios: 'exclamationmark.triangle.fill',
    android: 'warning',
    color: colors.error,
  },
  issue_updated: {
    ios: 'exclamationmark.triangle.fill',
    android: 'warning',
    color: colors.warning,
  },
  supply_approved: {
    ios: 'checkmark.circle.fill',
    android: 'check-circle',
    color: colors.success,
  },
  supply_denied: {
    ios: 'xmark.circle.fill',
    android: 'cancel',
    color: colors.error,
  },
  document_uploaded: {
    ios: 'doc.fill',
    android: 'description',
    color: colors.primary,
  },
  notification_received: {
    ios: 'bell.fill',
    android: 'notifications',
    color: colors.accent,
  },
  vessel_status_changed: {
    ios: 'sailboat.fill',
    android: 'directions-boat',
    color: colors.primary,
  },
  task_assigned: {
    ios: 'person.fill.checkmark',
    android: 'assignment',
    color: colors.accent,
  },
  task_completed: {
    ios: 'checkmark.circle.fill',
    android: 'check-circle',
    color: colors.success,
  },
};

export function RealtimeFeed({ userId, limit = 20, showUnreadOnly = false }: RealtimeFeedProps) {
  const { events, unreadCount, markAsRead, markAllAsRead, refresh } = useRealtime({ userId });
  const [refreshing, setRefreshing] = useState(false);

  const filteredEvents = showUnreadOnly ? events.filter(e => !e.read) : events;
  const displayEvents = filteredEvents.slice(0, limit);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const getEventIcon = (type: string) => {
    return EVENT_ICONS[type] || {
      ios: 'bell.fill',
      android: 'notifications',
      color: colors.textSecondary,
    };
  };

  const getEventTitle = (event: RealtimeEvent): string => {
    switch (event.type) {
      case 'maintenance_updated':
        return 'Maintenance Updated';
      case 'issue_created':
        return 'New Issue Reported';
      case 'issue_updated':
        return 'Issue Updated';
      case 'supply_approved':
        return 'Supply Request Approved';
      case 'supply_denied':
        return 'Supply Request Denied';
      case 'document_uploaded':
        return 'Document Uploaded';
      case 'notification_received':
        return 'New Notification';
      case 'vessel_status_changed':
        return 'Vessel Status Changed';
      case 'task_assigned':
        return 'Task Assigned';
      case 'task_completed':
        return 'Task Completed';
      default:
        return 'Update';
    }
  };

  const getEventDescription = (event: RealtimeEvent): string => {
    if (event.data?.message) {
      return event.data.message;
    }
    if (event.data?.title) {
      return event.data.title;
    }
    return 'Tap to view details';
  };

  const renderEvent = ({ item }: { item: RealtimeEvent }) => {
    const icon = getEventIcon(item.type);
    const title = getEventTitle(item);
    const description = getEventDescription(item);

    return (
      <TouchableOpacity
        style={[styles.eventCard, !item.read && styles.eventCardUnread]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.eventIcon, { backgroundColor: icon.color + '20' }]}>
          <IconSymbol
            ios_icon_name={icon.ios}
            android_material_icon_name={icon.android}
            size={24}
            color={icon.color}
          />
        </View>

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.eventDescription} numberOfLines={2}>
            {description}
          </Text>
          <Text style={styles.eventTime}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Activity Feed</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllButtonText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={displayEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="bell.slash.fill"
              android_material_icon_name="notifications-off"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventCardUnread: {
    borderColor: colors.primary,
    borderWidth: 2,
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
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
});
