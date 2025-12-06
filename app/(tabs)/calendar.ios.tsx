
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, shadows } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { IconSymbol } from '@/components/IconSymbol';
import {
  getEventsForDate,
  getEventsForMonth,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  formatEventTime,
  getEventColor,
  getEventTypeLabel,
  sortEventsByDate,
} from '@/utils/calendarUtils';
import { CalendarEvent } from '@/types/calendar';

export default function CalendarScreen() {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const { calendarEvents, getCalendarEventsForUser } = useData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get events for the current user
  const userEvents = useMemo(() => {
    if (!user || !userRole) return [];
    return getCalendarEventsForUser(user.id, userRole);
  }, [user, userRole, calendarEvents, getCalendarEventsForUser]);

  // Get events for the selected date
  const selectedDateEvents = useMemo(() => {
    return sortEventsByDate(getEventsForDate(userEvents, selectedDate));
  }, [userEvents, selectedDate]);

  // Get events for the current month
  const monthEvents = useMemo(() => {
    return getEventsForMonth(userEvents, currentYear, currentMonth);
  }, [userEvents, currentYear, currentMonth]);

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentYear, currentMonth]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  }, [currentYear, currentMonth]);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  }, [currentYear, currentMonth]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  const handleDayPress = useCallback((day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  }, [currentYear, currentMonth]);

  const handleEventPress = useCallback((event: CalendarEvent) => {
    router.push({
      pathname: '/calendar-event-detail',
      params: { eventId: event.id },
    });
  }, [router]);

  const handleAddEvent = useCallback(() => {
    router.push({
      pathname: '/add-calendar-event',
      params: { date: selectedDate.toISOString() },
    });
  }, [router, selectedDate]);

  const getEventsForDay = useCallback((day: number): CalendarEvent[] => {
    const date = new Date(currentYear, currentMonth, day);
    return getEventsForDate(monthEvents, date);
  }, [currentYear, currentMonth, monthEvents]);

  const isToday = useCallback((day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  }, [currentYear, currentMonth]);

  const isSelectedDay = useCallback((day: number): boolean => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  }, [selectedDate, currentYear, currentMonth]);

  const renderCalendarDay = useCallback((day: number | null, index: number) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }

    const dayEvents = getEventsForDay(day);
    const hasEvents = dayEvents.length > 0;
    const isTodayDay = isToday(day);
    const isSelected = isSelectedDay(day);

    return (
      <TouchableOpacity
        key={`day-${day}`}
        style={[
          styles.dayCell,
          isTodayDay && styles.todayCell,
          isSelected && styles.selectedDayCell,
        ]}
        onPress={() => handleDayPress(day)}
      >
        <Text
          style={[
            styles.dayText,
            isTodayDay && styles.todayText,
            isSelected && styles.selectedDayText,
          ]}
        >
          {day}
        </Text>
        {hasEvents && (
          <View style={styles.eventIndicatorContainer}>
            {dayEvents.slice(0, 3).map((event, idx) => (
              <View
                key={`indicator-${event.id}-${idx}`}
                style={[
                  styles.eventIndicator,
                  { backgroundColor: getEventColor(event.type) },
                ]}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  }, [getEventsForDay, isToday, isSelectedDay, handleDayPress]);

  const renderEventItem = useCallback((event: CalendarEvent) => {
    const eventColor = getEventColor(event.type);
    const eventTypeLabel = getEventTypeLabel(event.type);

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventItem}
        onPress={() => handleEventPress(event)}
      >
        <View style={[styles.eventColorBar, { backgroundColor: eventColor }]} />
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {event.title}
            </Text>
            <View style={[styles.eventTypeBadge, { backgroundColor: eventColor + '20' }]}>
              <Text style={[styles.eventTypeText, { color: eventColor }]}>
                {eventTypeLabel}
              </Text>
            </View>
          </View>
          
          <View style={styles.eventDetails}>
            {!event.allDay && (
              <View style={styles.eventDetailRow}>
                <IconSymbol
                  ios_icon_name="clock.fill"
                  android_material_icon_name="schedule"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.eventDetailText}>
                  {formatEventTime(event.startDate)} - {formatEventTime(event.endDate)}
                </Text>
              </View>
            )}
            
            <View style={styles.eventDetailRow}>
              <IconSymbol
                ios_icon_name="sailboat.fill"
                android_material_icon_name="directions_boat"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.eventDetailText}>{event.vesselName}</Text>
            </View>
            
            {event.location && (
              <View style={styles.eventDetailRow}>
                <IconSymbol
                  ios_icon_name="location.fill"
                  android_material_icon_name="location_on"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.eventDetailText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleEventPress]);

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Calendar</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddEvent}
            >
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
          
          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePreviousMonth}
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="chevron_left"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            
            <View style={styles.monthDisplay}>
              <Text style={styles.monthText}>
                {getMonthName(currentMonth)} {currentYear}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNextMonth}
            >
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.todayButton}
              onPress={handleToday}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Day Headers */}
          <View style={styles.dayHeaderRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <View key={day} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => renderCalendarDay(day, index))}
          </View>
        </View>

        {/* Selected Date Events */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsSectionHeader}>
            <Text style={styles.eventsSectionTitle}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.eventsCount}>
              {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'}
            </Text>
          </View>

          {selectedDateEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="event"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={styles.emptyStateText}>No events scheduled</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleAddEvent}
              >
                <Text style={styles.emptyStateButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {selectedDateEvents.map(renderEventItem)}
            </View>
          )}
        </View>

        {/* Bottom Padding for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.accent,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  calendarContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  todayCell: {
    backgroundColor: colors.accent + '20',
    borderRadius: 8,
  },
  selectedDayCell: {
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  todayText: {
    color: colors.accent,
    fontWeight: '700',
  },
  selectedDayText: {
    color: colors.text,
    fontWeight: '700',
  },
  eventIndicatorContainer: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 2,
  },
  eventIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  eventsCount: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  eventsList: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  eventColorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventDetails: {
    gap: 6,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
