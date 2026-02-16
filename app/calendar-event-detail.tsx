
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles, shadows } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { IconSymbol } from '@/components/IconSymbol';
import { PressableCard } from '@/components/PressableCard';
import {
  formatEventDateRange,
  getEventColor,
  getEventTypeLabel,
} from '@/utils/calendarUtils';

export default function CalendarEventDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { calendarEvents, deleteCalendarEvent, updateCalendarEvent } = useData();

  const eventId = params.eventId as string;

  const event = useMemo(() => {
    return calendarEvents.find(e => e.id === eventId);
  }, [calendarEvents, eventId]);

  if (!event) {
    return (
      <View style={commonStyles.container}>
        <Stack.Screen options={{ title: 'Event Not Found' }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Event not found</Text>
        </View>
      </View>
    );
  }

  const eventColor = getEventColor(event.type);
  const eventTypeLabel = getEventTypeLabel(event.type);

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCalendarEvent(event.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleMarkComplete = () => {
    updateCalendarEvent(event.id, { status: 'completed' });
    Alert.alert('Success', 'Event marked as completed');
  };

  const handleMarkCancelled = () => {
    updateCalendarEvent(event.id, { status: 'cancelled' });
    Alert.alert('Success', 'Event marked as cancelled');
  };

  return (
    <View style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: 'Event Details',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete}>
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete"
                size={20}
                color={colors.danger}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Event Card */}
        <View style={styles.eventCard}>
          <View style={[styles.eventColorBar, { backgroundColor: eventColor }]} />
          
          <View style={styles.eventContent}>
            {/* Title and Type */}
            <View style={styles.titleRow}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={[styles.typeBadge, { backgroundColor: eventColor + '20' }]}>
                <Text style={[styles.typeBadgeText, { color: eventColor }]}>
                  {eventTypeLabel}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  event.status === 'completed' && styles.statusCompleted,
                  event.status === 'cancelled' && styles.statusCancelled,
                  event.status === 'in_progress' && styles.statusInProgress,
                ]}
              >
                <Text style={styles.statusText}>
                  {event.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Date/Time */}
            <View style={styles.detailRow}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="event"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.detailText}>
                {formatEventDateRange(event.startDate, event.endDate, event.allDay)}
              </Text>
            </View>

            {/* Vessel */}
            <PressableCard
              variant="ghost"
              style={styles.detailRow}
              onPress={() => router.push({ pathname: '/vessel-detail', params: { id: event.vesselId } })}
            >
              <IconSymbol
                ios_icon_name="sailboat.fill"
                android_material_icon_name="directions-boat"
                size={20}
                color={colors.accent}
              />
              <Text style={[styles.detailText, { color: colors.accent }]}>{event.vesselName}</Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={16}
                color={colors.accent}
              />
            </PressableCard>

            {/* Location */}
            {event.location && (
              <View style={styles.detailRow}>
                <IconSymbol
                  ios_icon_name="location.fill"
                  android_material_icon_name="location-on"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
            )}

            {/* Attendees */}
            {event.attendeeNames.length > 0 && (
              <View style={styles.detailRow}>
                <IconSymbol
                  ios_icon_name="person.2.fill"
                  android_material_icon_name="group"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.detailText}>
                  {event.attendeeNames.join(', ')}
                </Text>
              </View>
            )}

            {/* Description */}
            {event.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.sectionText}>{event.description}</Text>
              </View>
            )}

            {/* Notes */}
            {event.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.sectionText}>{event.notes}</Text>
              </View>
            )}

            {/* Created By */}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Created by {event.createdByName}
              </Text>
              <Text style={styles.metaText}>
                {new Date(event.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {event.status === 'scheduled' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={handleMarkComplete}
            >
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.text}
              />
              <Text style={styles.actionButtonText}>Mark Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleMarkCancelled}
            >
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={20}
                color={colors.text}
              />
              <Text style={styles.actionButtonText}>Cancel Event</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  eventCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  eventColorBar: {
    width: 6,
  },
  eventContent: {
    flex: 1,
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusRow: {
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.accent + '20',
  },
  statusCompleted: {
    backgroundColor: colors.success + '20',
  },
  statusCancelled: {
    backgroundColor: colors.danger + '20',
  },
  statusInProgress: {
    backgroundColor: colors.warning + '20',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  section: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    ...shadows.small,
  },
  completeButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
