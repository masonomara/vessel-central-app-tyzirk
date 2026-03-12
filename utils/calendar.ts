
import { CalendarEvent, CalendarEventType } from '../types/calendar';
import { colors } from '../styles/commonStyles';

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  maintenance: 'Maintenance',
  charter: 'Charter',
  inspection: 'Inspection',
  crew_change: 'Crew Change',
  provisioning: 'Provisioning',
  meeting: 'Meeting',
  other: 'Other',
};

export const getEventTypeLabel = (type: CalendarEventType): string => {
  return EVENT_TYPE_LABELS[type] || 'Other';
};

export const formatEventTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatEventDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatEventDateRange = (start: Date, end: Date, allDay: boolean): string => {
  const startDate = formatEventDate(start);
  const endDate = formatEventDate(end);

  if (allDay) {
    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} - ${endDate}`;
  }

  if (startDate === endDate) {
    return `${startDate}, ${formatEventTime(start)} - ${formatEventTime(end)}`;
  }

  return `${startDate} ${formatEventTime(start)} - ${endDate} ${formatEventTime(end)}`;
};

export const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return events.filter(event => {
    const eventStart = new Date(event.startDate);
    eventStart.setHours(0, 0, 0, 0);

    const eventEnd = new Date(event.endDate);
    eventEnd.setHours(0, 0, 0, 0);

    return targetDate >= eventStart && targetDate <= eventEnd;
  });
};

export const getEventsForMonth = (events: CalendarEvent[], year: number, month: number): CalendarEvent[] => {
  return events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  });
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

export const sortEventsByDate = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
};
