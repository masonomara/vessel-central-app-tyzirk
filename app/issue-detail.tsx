import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { IconSymbol } from "@/components/IconSymbol";
import { LinkedDetailRow } from "@/components/LinkedDetailRow";
import { formatDate } from "@/utils/dateUtils";
import { TaskStatus, TaskPriority } from "@/types";

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams();
  const { issues, updateIssue, addIssueComment } = useData();
  const { userRole, userId, userName } = useAuth();
  const [commentText, setCommentText] = useState("");

  const issue = issues.find((i) => i.id === id);

  if (!issue) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Issue Not Found' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>This issue could not be found.</Text>
        </View>
      </View>
    );
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return colors.danger;
      case "high":
        return colors.warning;
      case "medium":
        return colors.accent;
      case "low":
        return colors.success;
      default:
        return colors.grey;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return colors.success;
      case "in_progress":
        return colors.accent;
      case "waiting_on_parts":
        return colors.warning;
      case "open":
        return colors.grey;
      default:
        return colors.grey;
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateIssue(issue.id, { status: newStatus });
    Alert.alert(
      "Updated",
      `Issue status changed to ${newStatus.replace("_", " ")}`,
    );
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addIssueComment(issue.id, {
      userId,
      userName,
      userRole,
      text: commentText.trim(),
      attachments: [],
    });
    setCommentText("");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Issue Details' }} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.title}>{issue.title}</Text>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: getPriorityColor(issue.priority) + "20" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: getPriorityColor(issue.priority) },
              ]}
            >
              {issue.priority.toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: getStatusColor(issue.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: getStatusColor(issue.status) },
              ]}
            >
              {issue.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>
          {issue.category && (
            <View
              style={[styles.badge, { backgroundColor: colors.accent + "20" }]}
            >
              <Text style={[styles.badgeText, { color: colors.accent }]}>
                {issue.category}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{issue.description}</Text>
        </View>

        <View style={styles.card}>
          <LinkedDetailRow
            label="Vessel"
            value={issue.vesselName}
            linkTo={{ pathname: "/vessel-detail", params: { id: issue.vesselId } }}
          />
          <DetailRow label="Reported By" value={issue.reportedByName} />
          <DetailRow
            label="Location"
            value={issue.location || "Not specified"}
          />
          <DetailRow
            label="Created"
            value={formatDate(new Date(issue.createdAt))}
          />
          {issue.assignedToName && (
            <DetailRow label="Assigned To" value={issue.assignedToName} />
          )}
          {issue.resolvedAt && (
            <DetailRow
              label="Resolved"
              value={formatDate(new Date(issue.resolvedAt))}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Comments ({issue.comments.length})
          </Text>
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
              placeholderTextColor={colors.textMuted}
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
                color={commentText.trim() ? colors.accent : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {(userRole === "owner" || userRole === "manager") &&
          issue.status !== "completed" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <View style={styles.actionRow}>
                {issue.status === "open" && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.accent },
                    ]}
                    onPress={() => handleStatusChange("in_progress")}
                  >
                    <Text style={styles.actionButtonText}>Start Work</Text>
                  </TouchableOpacity>
                )}
                {issue.status === "in_progress" && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.success },
                    ]}
                    onPress={() => handleStatusChange("completed")}
                  >
                    <Text style={styles.actionButtonText}>Mark Resolved</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  content: { flex: 1, padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabel: { fontSize: 14, color: colors.textMuted },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: "500" },
  commentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  commentAuthor: { fontSize: 13, fontWeight: "600", color: colors.text },
  commentDate: { fontSize: 12, color: colors.textMuted },
  commentBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  commentInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.card,
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
  actionRow: { flexDirection: "row", gap: 12 },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});
