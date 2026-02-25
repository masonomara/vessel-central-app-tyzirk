import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
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
import { PriorityDetailRow } from "../components/PriorityDetailRow";

import { DetailNotFound } from "../components/DetailNotFound";
import { formatDate, formatDateLong } from "../utils/dateUtils";
import { TaskStatus, TaskPriority } from "../types";
import { useTopPadding } from "../hooks/useTopPadding";

const MOCK_USERS: Record<string, string> = {
  manager1: "Sarah Johnson",
  manager2: "Tom Wilson",
  manager3: "Alex Martinez",
  crew1: "Mike Davis",
  crew2: "Sarah Williams",
  crew3: "Jane Smith",
  crew4: "Tom Anderson",
  crew5: "Lisa Martinez",
};

export default function IssueDetailScreen() {
  const topPadding = useTopPadding();
  const { id } = useLocalSearchParams();
  const { issues, vessels, updateIssue, addIssueComment } = useData();
  const { userRole, userId, userName } = useAuth();
  const [commentText, setCommentText] = useState("");

  const issue = issues.find((i) => i.id === id);

  if (!issue) {
    return <DetailNotFound title="Issue Not Found" />;
  }

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateIssue(issue.id, { status: newStatus });
    Alert.alert(
      "Updated",
      `Issue status changed to ${newStatus.replace("_", " ")}`,
    );
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    if (!userId || !userName) return;
    addIssueComment(issue.id, {
      userId,
      userName,
      userRole,
      text: commentText.trim(),
      attachments: [],
    });
    setCommentText("");
  };

  const handleAssign = () => {
    const vessel = vessels.find((v) => v.id === issue.vesselId);
    if (!vessel) return;

    const assignableIds = [vessel.managerId, ...(vessel.crewIds || [])].filter(
      Boolean,
    );

    const assignable = assignableIds
      .map((id) => ({ id, name: MOCK_USERS[id] }))
      .filter((u) => u.name);

    if (assignable.length === 0) {
      Alert.alert("No Crew", "No assignable crew for this vessel.");
      return;
    }

    if (Platform.OS === "ios") {
      const labels = [...assignable.map((u) => u.name), "Cancel"];
      ActionSheetIOS.showActionSheetWithOptions(
        { options: labels, cancelButtonIndex: labels.length - 1 },
        (index) => {
          if (index < assignable.length) {
            const picked = assignable[index];
            updateIssue(issue.id, {
              assignedTo: picked.id,
              assignedToName: picked.name,
            });
            Alert.alert("Assigned", `Issue assigned to ${picked.name}`);
          }
        },
      );
    }
  };

  return (
    <View style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: "Issue Details",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        contentContainerStyle={[ds.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{issue.title}</Text>
          {/* <Text style={ds.subtitle}>
            {issue.category ? `${issue.category} issue` : "Issue"} reported{" "}
            {formatDateLong(new Date(issue.createdAt))} by{" "}
            {issue.reportedByName}
          </Text> */}
        </View>
        <PriorityDetailRow
          items={[
            {
              label: "Vessel",
              value: issue.vesselName,
              icon: {
                ios_icon_name: "sailboat.fill",
                android_material_icon_name: "directions-boat",
              },
              linkTo: {
                pathname: "/vessel-detail",
                params: { id: issue.vesselId },
              },
            },
            {
              label: "Assigned To",
              value: issue.assignedToName || "Unassigned",
              icon: {
                ios_icon_name: "person.fill",
                android_material_icon_name: "person",
              },
            },
          ]}
        />
        {(userRole === "owner" || userRole === "manager") && (
          <>
            {!issue.assignedToName && issue.status !== "completed" && (
              <DetailRow
                button={{
                  label: "Assign to Crew",
                  onPress: handleAssign,
                  color: colors.text,
                }}
              />
            )}
            <DropdownRow
              label="Priority"
              options={[
                { label: "Urgent", value: "urgent" },
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ]}
              selectedValue={issue.priority}
              onSelect={(value) =>
                updateIssue(issue.id, { priority: value as TaskPriority })
              }
            />
            <DropdownRow
              label="Status"
              options={[
                { label: "Open", value: "open" },
                { label: "In Progress", value: "in_progress" },
                { label: "Completed", value: "completed" },
              ]}
              selectedValue={issue.status}
              onSelect={(value) => handleStatusChange(value as TaskStatus)}
            />
          </>
        )}
        <DetailRow label="Description" value={issue.description} />

        {issue.attachments.length > 0 && (
          <View style={ds.section}>
            <Text style={ds.sectionTitle}>
              Attachments ({issue.attachments.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.attachmentRow}>
                {issue.attachments.map((att) => (
                  <View key={att.id} style={styles.attachmentThumb}>
                    {att.type === "image" ? (
                      <Image
                        source={{ uri: att.uri }}
                        style={styles.attachmentImage}
                      />
                    ) : (
                      <View style={styles.attachmentPlaceholder}>
                        <IconSymbol
                          ios_icon_name="play.circle.fill"
                          android_material_icon_name="play-circle"
                          size={32}
                          color={colors.text}
                        />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <DetailRow label="Location" value={issue.location || "Not specified"} />

        {issue.resolvedAt && (
          <DetailRow
            label="Resolved"
            value={formatDate(new Date(issue.resolvedAt))}
          />
        )}

        <View style={ds.sectionOblique}>
          {issue.comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.userName}</Text>
                <Text style={styles.commentDate}>
                  {formatDate(new Date(comment.createdAt))}
                </Text>
              </View>
              <Text style={styles.commentBody}>{comment.text}</Text>
            </View>
          ))}
          <View style={styles.commentInput}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
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
                size={32}
                color={commentText.trim() ? colors.accent : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  attachmentRow: {
    flexDirection: "row",
    gap: 12,
  },
  attachmentThumb: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.surfaceOne,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachmentImage: { width: 120, height: 120 },
  attachmentPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  commentCard: {
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  commentAuthor: { fontSize: 15, fontWeight: "500", color: colors.text, lineHeight: 20, },
  commentDate: { fontSize: 12, color: colors.textTertiary, lineHeight: 15, },
  commentBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  commentInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sendButton: { padding: 4 },
  sendButtonDisabled: { opacity: 0.5 },
});
