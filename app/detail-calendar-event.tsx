import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  commonStyles,
  colors,
  detailScreenStyles as ds,
} from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { IconSymbol } from "../components/IconSymbol";
import { DetailRow } from "../components/DetailRow";
import { DropdownRow } from "../components/DropdownRow";
import { DetailCellPair } from "../components/DetailCellPair";
import { DetailNotFound } from "../components/DetailNotFound";
import {
  formatEventDateRange,
  getEventTypeLabel,
} from "../utils/calendar";
import { formatDate, formatLabel } from "../utils/formatting";
import { CalendarEventStatus } from "../types";
import { scrollProps } from "../hooks/useTopPadding";


export default function CalendarEventDetailScreen() {
  const { eventId } = useLocalSearchParams();
  const { calendarEvents, updateCalendarEvent, addCalendarEventComment } =
    useData();
  const { userRole, userId, userName } = useAuth();
  const [commentText, setCommentText] = useState("");

  const event = calendarEvents.find((e) => e.id === eventId);

  if (!event) {
    return <DetailNotFound title="Event Not Found" />;
  }

  const handleStatusChange = (value: CalendarEventStatus) => {
    updateCalendarEvent(event.id, { status: value });
    addCalendarEventComment(event.id, {
      userId,
      userName,
      userRole,
      text: `${userName} changed status to ${formatLabel(value)}`,
      isSystemComment: true,
      attachments: [],
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    if (!userId || !userName) return;
    addCalendarEventComment(event.id, {
      userId,
      userName,
      userRole,
      text: commentText.trim(),
      attachments: [],
    });
    setCommentText("");
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
        style={{ flex: 1 }}
        contentContainerStyle={[
          ds.scrollContent,
          { flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{event.title}</Text>
        </View>

        <DetailCellPair
          items={[
            {
              label: "Vessel",
              value: event.vesselName,
              icon: {
                ios_icon_name: "sailboat.fill",
                android_material_icon_name: "directions-boat",
              },
              linkTo: {
                pathname: "/detail-vessel",
                params: { id: event.vesselId },
              },
            },
            {
              label: "Location",
              value: event.location || "—",
              icon: {
                ios_icon_name: "mappin.circle.fill",
                android_material_icon_name: "place",
              },
            },
          ]}
        />

        <DropdownRow
          label="Status"
          options={[
            { label: "Scheduled", value: "scheduled" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ]}
          selectedValue={event.status}
          onSelect={(value) => handleStatusChange(value as CalendarEventStatus)}
        />
        <DetailRow label="Type" inline value={getEventTypeLabel(event.type)} />
        <DetailRow label="Created By" inline value={event.createdByName} />
        <DetailRow
          label="Date"
          inline
          value={formatEventDateRange(
            event.startDate,
            event.endDate,
            event.allDay,
          )}
        />
        {event.attendeeNames.length > 0 && (
          <DetailRow label="Attendees" value={event.attendeeNames.join(", ")} />
        )}
        {event.description && (
          <DetailRow label="Description" value={event.description} />
        )}
        {event.notes && <DetailRow label="Notes" value={event.notes} />}

        <View style={styles.historySection}>
          <View style={styles.commentCard}>
            <View style={styles.commentIcon}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={15}
                color={colors.text}
              />
            </View>
            <View style={styles.commentContent}>
              <Text style={styles.commentAuthor}>
                {event.createdByName} created this event
              </Text>
              <Text style={styles.commentDate}>
                {formatDate(new Date(event.createdAt))}
              </Text>
            </View>
          </View>

          {(event.comments || []).map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentIcon}>
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={15}
                  color={colors.text}
                />
              </View>
              <View style={styles.commentContent}>
                <Text style={styles.commentAuthor}>
                  {comment.isSystemComment ? comment.text : comment.userName}
                </Text>
                <Text style={styles.commentDate}>
                  {formatDate(new Date(comment.createdAt))}
                </Text>
                {!comment.isSystemComment && (
                  <Text style={styles.commentBody}>{comment.text}</Text>
                )}
              </View>
            </View>
          ))}

          <View style={styles.commentInput}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !commentText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleAddComment}
              disabled={!commentText.trim()}
            >
              <IconSymbol
                ios_icon_name="arrow.up.circle.fill"
                android_material_icon_name="send"
                size={20}
                color={colors.container}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  historySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.surfaceTwo,
    borderColor: colors.borderSoft,
    flex: 1,
  },
  commentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 24,
  },
  commentIcon: {
    padding: 6,
    marginTop: 4.5,
    backgroundColor: colors.surfaceThree,
    borderRadius: 100,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
    lineHeight: 20,
  },
  commentDate: { fontSize: 12, color: colors.textTertiary, lineHeight: 15 },
  commentBody: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 19,
    marginTop: 4,
  },
  commentInput: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
    marginTop: "auto",
    backgroundColor: colors.container,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: { padding: 6, backgroundColor: colors.text, borderRadius: 8 },
  sendButtonDisabled: { opacity: 0.5 },
});
