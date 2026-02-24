import React from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  commonStyles,
  colors,
  detailScreenStyles as ds,
} from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { DetailRow } from "../components/DetailRow";
import { DropdownRow } from "../components/DropdownRow";

import { DetailNotFound } from "../components/DetailNotFound";
import {
  formatEventDateRange,
  getEventTypeLabel,
} from "../utils/calendarUtils";
import { CalendarEventType } from "../types";
import { useTopPadding } from "../hooks/useTopPadding";

export default function CalendarEventDetailScreen() {
  const topPadding = useTopPadding();
  const { eventId } = useLocalSearchParams();
  const { calendarEvents, deleteCalendarEvent, updateCalendarEvent } =
    useData();

  const event = calendarEvents.find((e) => e.id === eventId);

  if (!event) {
    return <DetailNotFound title="Event Not Found" />;
  }

  const eventTypeLabel = getEventTypeLabel(event.type);

  const handleDelete = () => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteCalendarEvent(event.id);
          router.back();
        },
      },
    ]);
  };

  const handleMarkComplete = () => {
    updateCalendarEvent(event.id, { status: "completed" });
    Alert.alert("Success", "Event marked as completed");
  };

  const handleMarkCancelled = () => {
    updateCalendarEvent(event.id, { status: "cancelled" });
    Alert.alert("Success", "Event marked as cancelled");
  };

  return (
    <View style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: "Event Details",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        contentContainerStyle={[ds.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{event.title}</Text>
        </View>

        <DropdownRow
          label="Type"
          options={[
            { label: "Maintenance", value: "maintenance" },
            { label: "Charter", value: "charter" },
            { label: "Inspection", value: "inspection" },
            { label: "Crew Change", value: "crew_change" },
            { label: "Provisioning", value: "provisioning" },
            { label: "Meeting", value: "meeting" },
            { label: "Other", value: "other" },
          ]}
          selectedValue={event.type}
          onSelect={(value) => updateCalendarEvent(event.id, { type: value as CalendarEventType })}
        />

        {event.description && (
          <DetailRow label="Description" value={event.description} />
        )}
        <DetailRow
          label="Date"
          value={formatEventDateRange(
            event.startDate,
            event.endDate,
            event.allDay,
          )}
        />
        <DetailRow
          label="Vessel"
          value={event.vesselName}
          linkTo={{
            pathname: "/vessel-detail",
            params: { id: event.vesselId },
          }}
        />
        {event.location && (
          <DetailRow label="Location" value={event.location} />
        )}
        {event.attendeeNames.length > 0 && (
          <DetailRow label="Attendees" value={event.attendeeNames.join(", ")} />
        )}
        <DetailRow label="Created By" value={event.createdByName} />
        <DetailRow
          label="Created"
          value={new Date(event.createdAt).toLocaleDateString()}
        />

        {event.notes && (
          <DetailRow label="Notes" value={event.notes} />
        )}

        <DropdownRow
          label="Status"
          options={[
            { label: "Scheduled", value: "scheduled" },
            { label: "Cancelled", value: "cancelled" },
          ]}
          selectedValue={event.status}
          onSelect={(value) => {
            if (value === "cancelled") handleMarkCancelled();
            else if (value === "scheduled") {
              updateCalendarEvent(event.id, { status: "scheduled" });
            }
          }}
        />
        <DetailRow
          label="Complete"
          button={{
            label: "Mark Complete",
            onPress: handleMarkComplete,
            color: colors.success,
          }}
        />

        <DetailRow
          label="Delete"
          button={{
            label: "Delete Event",
            onPress: handleDelete,
            color: colors.danger,
          }}
        />
      </ScrollView>
    </View>
  );
}
