
export type CalendarEventType = 
  | 'maintenance' 
  | 'charter' 
  | 'inspection' 
  | 'crew_change' 
  | 'provisioning' 
  | 'meeting' 
  | 'other';

export type CalendarEventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: CalendarEventType;
  status: CalendarEventStatus;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  vesselId: string;
  vesselName: string;
  location?: string;
  attendees: string[];
  attendeeNames: string[];
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  notes: string;
  reminders: EventReminder[];
  relatedTaskId?: string;
  relatedIssueId?: string;
  color?: string;
}

export interface EventReminder {
  id: string;
  minutes: number;
  method: 'notification' | 'email';
}

export interface CalendarFilter {
  vesselIds: string[];
  eventTypes: CalendarEventType[];
  statuses: CalendarEventStatus[];
  dateRange: {
    start: Date;
    end: Date;
  };
}
