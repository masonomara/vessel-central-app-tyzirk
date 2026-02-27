import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { scrollProps } from "../../../hooks/useTopPadding";
import { ProfileHeaderButton } from "../../../components/ProfileHeaderButton";
import { colors, commonStyles, shadows } from "../../../styles/commonStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";
import { IconSymbol } from "../../../components/IconSymbol";
import { ItemCard } from "../../../components/ItemCard";
import {
  getEventsForDate,
  getEventsForMonth,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  formatEventTime,
  formatEventDateRange,
  getEventColor,
  getEventTypeLabel,
  sortEventsByDate,
} from "../../../utils/calendarUtils";
import { CalendarEvent } from "../../../types/calendar";

export default function CalendarScreen() {
  const router = useRouter();
  const { userId, userRole } = useAuth();
  const { calendarEvents, getCalendarEventsForUser } = useData();

  const insets = useSafeAreaInsets();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get events for the current user
  const userEvents = useMemo(() => {
    if (!userId || !userRole) return [];
    return getCalendarEventsForUser(userId, userRole);
  }, [userId, userRole, calendarEvents, getCalendarEventsForUser]);

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

  const handleDayPress = useCallback(
    (day: number) => {
      const newDate = new Date(currentYear, currentMonth, day);
      setSelectedDate(newDate);
    },
    [currentYear, currentMonth],
  );

  const handleEventPress = useCallback(
    (event: CalendarEvent) => {
      router.push({
        pathname: "/calendar-event-detail",
        params: { eventId: event.id },
      });
    },
    [router],
  );

  const handleAddEvent = useCallback(() => {
    router.push({
      pathname: "/add-calendar-event",
      params: { date: selectedDate.toISOString() },
    });
  }, [router, selectedDate]);

  const getEventsForDay = useCallback(
    (day: number): CalendarEvent[] => {
      const date = new Date(currentYear, currentMonth, day);
      return getEventsForDate(monthEvents, date);
    },
    [currentYear, currentMonth, monthEvents],
  );

  const isToday = useCallback(
    (day: number): boolean => {
      const today = new Date();
      return (
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear()
      );
    },
    [currentYear, currentMonth],
  );

  const isSelectedDay = useCallback(
    (day: number): boolean => {
      return (
        day === selectedDate.getDate() &&
        currentMonth === selectedDate.getMonth() &&
        currentYear === selectedDate.getFullYear()
      );
    },
    [selectedDate, currentYear, currentMonth],
  );

  const renderCalendarDay = useCallback(
    (day: number | null, index: number) => {
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
                    { backgroundColor: isSelected ? colors.container : colors.text },
                  ]}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [getEventsForDay, isToday, isSelectedDay, handleDayPress],
  );

  const renderEventItem = useCallback(
    (event: CalendarEvent, index: number, array: CalendarEvent[]) => (
      <ItemCard
        key={event.id}
        title={event.title}
        description={event.description}
        vesselName={event.vesselName}
        onPress={() => handleEventPress(event)}
        isLast={index === array.length - 1}
        style={{ marginHorizontal: 0 }}
        badge={event.location ? {
          label: event.location,
          fg: colors.textSecondary,
          bg: colors.surfaceThree,
        } : undefined}
        metaText={formatEventDateRange(
          event.startDate,
          event.endDate,
          event.allDay,
        )}
      />
    ),
    [handleEventPress],
  );

  return (
    <View style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: "Calendar",
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <TouchableOpacity onPress={handleAddEvent}>
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
              <ProfileHeaderButton />
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 64 },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={styles.header}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePreviousMonth}
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="chevron-left"
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
                android_material_icon_name="chevron-right"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.todayButton} onPress={handleToday}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Day Headers */}
          <View style={styles.dayHeaderRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
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
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={styles.eventsCount}>
              {selectedDateEvents.length}{" "}
              {selectedDateEvents.length === 1 ? "event" : "events"}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceOne,
    alignItems: "center",
    justifyContent: "center",
  },
  monthDisplay: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  monthText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  todayButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.text,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.container,
  },
  calendarContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.surfaceOne,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayHeaderRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 36,
  },
  todayCell: {
    backgroundColor: colors.surfaceThree,
    borderRadius: 100,
  },
  selectedDayCell: {
    backgroundColor: colors.text,
    borderRadius: 100,
  },
  dayText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  todayText: {
    color: colors.textSecondary,
    fontWeight: "500",
  },
  selectedDayText: {
    color: colors.container,
    fontWeight: "500",
  },
  eventIndicatorContainer: {
    flexDirection: "row",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  eventsCount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  eventsList: {
    gap: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
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
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
});
