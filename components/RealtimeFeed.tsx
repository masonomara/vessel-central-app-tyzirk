
import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRealtime } from '@/hooks/useRealtime';
import { RealtimeEvent } from '@/utils/realtimeManager';

interface RealtimeFeedProps {
  userId?: string;
  maxItems?: number;
}

export default function RealtimeFeed({ userId, maxItems = 10 }: RealtimeFeedProps) {
  const { events, unreadCount, markAsRead, markAllAsRead } = useRealtime({ userId });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'maintenance_updated':
      case 'task_completed':
        return { ios: 'checkmark.circle.fill', android: 'check_circle', color: colors.success };
      case 'issue_created':
      case 'issue_updated':
        return { ios: 'exclamationmark.triangle.fill', android: 'warning', color: colors.danger };
      case 'supply_approved':
        return { ios: 'checkmark.circle.fill', android: 'check_circle', color: colors.success };
      case 'supply_denied':
        return { ios: 'xmark.circle.fill', android: 'cancel', color: colors.danger };
      case 'document_uploaded':
        return { ios: 'doc.text.fill', android: 'description', color: colors.accent };
      case 'vessel_status_changed':
        return { ios: 'sailboat.fill', android: 'sailing', color: colors.accent };
      case 'task_assigned':
        return { ios: 'person.badge.plus.fill', android: 'person_add', color: colors.warning };
      default:
        return { ios: 'bell.fill', android: 'notifications', color: colors.accent };
    }
  };

  const formatEventMessage = (event: RealtimeEvent): string => {
    switch (event.type) {
      case 'maintenance_updated':
        return `Maintenance task "${event.data.title}" was updated`;
      case 'task_completed':
        return `Task "${event.data.title}" was completed`;
      case 'issue_created':
        return `New issue: "${event.data.title}"`;
      case 'issue_updated':
        return `Issue "${event.data.title}" was updated`;
      case 'supply_approved':
        return `Supply request for "${event.data.itemName}" was approved`;
      case 'supply_denied':
        return `Supply request for "${event.data.itemName}" was denied`;
      case 'document_uploaded':
        return `Document "${event.data.title}" was uploaded`;
      case 'vessel_status_changed':
        return `Vessel "${event.data.vesselName}" status changed to ${event.data.status}`;
      case 'task_assigned':
        return `You were assigned to "${event.data.title}"`;
      default:
        return 'New activity';
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return 'Just now';
    }
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return `${days}d ago`;
  };

  const displayEvents = events.slice(0, maxItems);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol 
            ios_icon_name="bolt.fill" 
            android_material_icon_name="flash_on" 
            size={20} 
            color={colors.accent} 
          />
          <Text style={styles.headerTitle}>Live Updates</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {displayEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol 
            ios_icon_name="bell.slash" 
            android_material_icon_name="notifications_off" 
            size={32} 
            color={colors.textSecondary} 
          />
          <Text style={styles.emptyText}>No recent updates</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.eventsList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {displayEvents.map((event, index) => {
            const icon = getEventIcon(event.type);
            
            return (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventItem, !event.read && styles.eventItemUnread]}
                onPress={() => markAsRead(event.id)}
              >
                <View style={[styles.eventIcon, { backgroundColor: icon.color + '20' }]}>
                  <IconSymbol 
                    ios_icon_name={icon.ios} 
                    android_material_icon_name={icon.android} 
                    size={20} 
                    color={icon.color} 
                  />
                </View>
                <View style={styles.eventContent}>
                  <Text style={[styles.eventMessage, !event.read && styles.eventMessageUnread]}>
                    {formatEventMessage(event)}
                  </Text>
                  <Text style={styles.eventTime}>{formatTime(event.timestamp)}</Text>
                </View>
                {!event.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  unreadBadge: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  eventsList: {
    maxHeight: 300,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventItemUnread: {
    backgroundColor: colors.accent + '05',
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    flex: 1,
  },
  eventMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  eventMessageUnread: {
    color: colors.text,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
