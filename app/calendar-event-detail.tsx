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
import { DetailNotFound } from "../components/DetailNotFound";
import {
  formatEventDateRange,
  getEventColor,
  getEventTypeLabel,
} from "../utils/calendarUtils";
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

  const eventColor = getEventColor(event.type);
  const eventTypeLabel = getEventTypeLabel(event.type);

  const getEventStatusColor = () => {
    switch (event.status) {
      case "completed":
        return colors.success;
      case "cancelled":
        return colors.danger;
      case "in_progress":
        return colors.warning;
      default:
        return colors.accent;
    }
  };

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
      <Stack.Screen options={{ title: "", headerBackTitle: "Back" }} />

      <ScrollView
        contentContainerStyle={[ds.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{event.title}</Text>
          <View style={ds.badgeRow}>
            <View style={[ds.badge, { backgroundColor: eventColor + "20" }]}>
              <Text style={[ds.badgeText, { color: eventColor }]}>
                {eventTypeLabel}
              </Text>
            </View>
            <View
              style={[
                ds.badge,
                { backgroundColor: getEventStatusColor() + "20" },
              ]}
            >
              <Text style={[ds.badgeText, { color: getEventStatusColor() }]}>
                {event.status.replace("_", " ").toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

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

        <DetailRow
          label="Status"
          chips={{
            options: [
              { label: "Scheduled", value: "scheduled", color: colors.accent },
              { label: "Cancelled", value: "cancelled", color: colors.danger },
            ],
            selectedValue: event.status,
            onSelect: (value) => {
              if (value === "cancelled") handleMarkCancelled();
              else if (value === "scheduled") {
                updateCalendarEvent(event.id, { status: "scheduled" });
              }
            },
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
