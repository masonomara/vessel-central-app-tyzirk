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
import { PriorityDetailRow } from "../components/PriorityDetailRow";

import { DetailNotFound } from "../components/DetailNotFound";
import { formatDate } from "../utils/dateUtils";
import { formatLabel } from "../utils/formatLabel";
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
    addIssueComment(issue.id, {
      userId,
      userName,
      userRole,
      text: `${userName} changed status to ${formatLabel(newStatus)}`,
      isSystemComment: true,
      attachments: [],
    });
  };

  const handlePriorityChange = (value: TaskPriority) => {
    updateIssue(issue.id, { priority: value });
    addIssueComment(issue.id, {
      userId,
      userName,
      userRole,
      text: `${userName} updated priority to ${formatLabel(value)}`,
      isSystemComment: true,
      attachments: [],
    });
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
            addIssueComment(issue.id, {
              userId,
              userName,
              userRole,
              text: `${userName} assigned to ${picked.name}`,
              isSystemComment: true,
              attachments: [],
            });
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
        contentContainerStyle={[
          ds.scrollContent,
          { paddingTop: topPadding, flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{issue.title}</Text>
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
              onSelect={(value) => handlePriorityChange(value as TaskPriority)}
            />
            <DropdownRow
              label="Status"
              options={[
                { label: "Open", value: "open" },
                { label: "In Progress", value: "in_progress" },
                { label: "Waiting on Parts", value: "waiting_on_parts" },
                { label: "Completed", value: "completed" },
              ]}
              selectedValue={issue.status}
              onSelect={(value) => handleStatusChange(value as TaskStatus)}
            />
          </>
        )}
        <DetailRow label="Category" inline value={issue.category} />
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
                {issue.reportedByName} created this issue
              </Text>
              <Text style={styles.commentDate}>
                {formatDate(new Date(issue.createdAt))}
              </Text>
            </View>
          </View>

          {(issue.comments || []).map((comment) => (
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
  historySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.surfaceTwo,
    borderColor: colors.borderSoft,
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
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
