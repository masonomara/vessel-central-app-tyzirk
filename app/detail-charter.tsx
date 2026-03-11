import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
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
import { DetailNotFound } from "../components/DetailNotFound";
import { formatDate, formatLabel } from "../utils/formatting";
import { CharterStatus } from "../types";
import { scrollProps } from "../hooks/useTopPadding";


export default function CharterDetailScreen() {
  const { id } = useLocalSearchParams();
  const { charterLogs, updateCharterLog, addCharterLogComment } = useData();
  const { userRole, userId, userName } = useAuth();
  const [commentText, setCommentText] = useState("");

  const charter = charterLogs.find((c) => c.id === id);

  if (!charter) {
    return <DetailNotFound title="Charter Not Found" />;
  }

  const handleStatusChange = (newStatus: string) => {
    updateCharterLog(charter.id, { status: newStatus as CharterStatus });
    addCharterLogComment(charter.id, {
      userId,
      userName,
      userRole,
      text: `${userName} changed status to ${formatLabel(newStatus)}`,
      isSystemComment: true,
      attachments: [],
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    if (!userId || !userName) return;
    addCharterLogComment(charter.id, {
      userId,
      userName,
      userRole,
      text: commentText.trim(),
      attachments: [],
    });
    setCommentText("");
  };

  const netRevenue = charter.revenue - charter.expenses;

  return (
    <View style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: "Charter Details",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[ds.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{charter.title}</Text>
        </View>

        <DropdownRow
          label="Status"
          options={[
            { label: "Upcoming", value: "upcoming" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ]}
          selectedValue={charter.status}
          onSelect={(value) => handleStatusChange(value)}
        />

        <DetailRow
          label="Vessel"
          inline
          value={charter.vesselName}
          linkTo={{
            pathname: "/detail-vessel",
            params: { id: charter.vesselId },
          }}
        />
        <DetailRow
          label="Dates"
          inline
          value={
            formatDate(charter.startDate) +
            " \u2014 " +
            formatDate(charter.endDate)
          }
        />
        <DetailRow
          label="Guest Count"
          inline
          value={String(charter.guestCount)}
        />
        {charter.guestNames ? (
          <DetailRow label="Guest Names" value={charter.guestNames} />
        ) : null}
        <DetailRow
          label="Departure Port"
          inline
          value={charter.departurePort}
        />
        <DetailRow label="Arrival Port" inline value={charter.arrivalPort} />
        <DetailRow label="Itinerary" value={charter.itinerary} />
        {charter.brokerName ? (
          <DetailRow label="Broker" inline value={charter.brokerName} />
        ) : null}

        <DetailRow
          label="Revenue"
          inline
          value={"$" + charter.revenue.toLocaleString()}
        />
        <DetailRow
          label="Expenses"
          inline
          value={"$" + charter.expenses.toLocaleString()}
        />
        <DetailRow
          label="Net Revenue"
          inline
          value={
            (netRevenue >= 0 ? "$" : "-$") +
            Math.abs(netRevenue).toLocaleString()
          }
        />
        {charter.brokerCommission != null ? (
          <DetailRow
            label="Broker Commission"
            inline
            value={"$" + charter.brokerCommission.toLocaleString()}
          />
        ) : null}

        {charter.specialRequests ? (
          <DetailRow label="Special Requests" value={charter.specialRequests} />
        ) : null}
        <DetailRow label="Notes" value={charter.notes || "No notes"} />

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
                {charter.createdByName} created this charter
              </Text>
              <Text style={styles.commentDate}>
                {formatDate(new Date(charter.createdAt))}
              </Text>
            </View>
          </View>

          {(charter.comments || []).map((comment) => (
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
