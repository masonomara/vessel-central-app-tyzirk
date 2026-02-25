import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
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
import { formatDate, formatDueDate, isOverdue } from "../utils/dateUtils";
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

export default function MaintenanceDetailScreen() {
  const topPadding = useTopPadding();
  const { id } = useLocalSearchParams();
  const {
    maintenanceTasks,
    vessels,
    updateMaintenanceTask,
    completeMaintenanceTask,
    addMaintenanceComment,
  } = useData();
  const { userRole, userId, userName } = useAuth();
  const [commentText, setCommentText] = useState("");

  const task = maintenanceTasks.find((t) => t.id === id);

  if (!task) {
    return <DetailNotFound title="Task Not Found" />;
  }

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateMaintenanceTask(task.id, { status: newStatus });
    addMaintenanceComment(task.id, {
      userId,
      userName,
      userRole,
      text: `${userName} changed status to ${formatLabel(newStatus)}`,
      isSystemComment: true,
      attachments: [],
    });
  };

  const handlePriorityChange = (value: TaskPriority) => {
    updateMaintenanceTask(task.id, { priority: value });
    addMaintenanceComment(task.id, {
      userId,
      userName,
      userRole,
      text: `${userName} updated priority to ${formatLabel(value)}`,
      isSystemComment: true,
      attachments: [],
    });
  };

  const handleComplete = () => {
    if (!userId || !userName) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (Platform.OS === "ios") {
      Alert.prompt(
        "Complete Task",
        "Enter actual cost (optional):",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Complete",
            onPress: (costInput?: string) => {
              completeMaintenanceTask(task.id, {
                completedBy: userId,
                completedByName: userName,
                completedAt: new Date(),
                notes: "Task completed",
                attachments: [],
                cost: costInput ? parseFloat(costInput) : undefined,
              });
              Alert.alert("Success", "Task completed successfully");
              router.back();
            },
          },
        ],
        "plain-text",
        "",
        "numeric",
      );
    } else {
      Alert.alert("Complete Task", "Mark this task as completed?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: () => {
            completeMaintenanceTask(task.id, {
              completedBy: userId,
              completedByName: userName,
              completedAt: new Date(),
              notes: "Task completed",
              attachments: [],
            });
            Alert.alert("Success", "Task completed successfully");
            router.back();
          },
        },
      ]);
    }
  };

  const handleAssign = () => {
    const vessel = vessels.find((v) => v.id === task.vesselId);
    if (!vessel) return;

    const assignableIds = [
      vessel.managerId,
      ...(vessel.crewIds || []),
    ].filter(Boolean);

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
            updateMaintenanceTask(task.id, {
              assignedTo: picked.id,
              assignedToName: picked.name,
            });
            addMaintenanceComment(task.id, {
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

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    if (!userId || !userName) return;
    addMaintenanceComment(task.id, {
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
          title: "Maintenance Details",
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
          <Text style={ds.title}>{task.title}</Text>
        </View>

        <PriorityDetailRow
          items={[
            {
              label: "Vessel",
              value: task.vesselName,
              icon: {
                ios_icon_name: "sailboat.fill",
                android_material_icon_name: "directions-boat",
              },
              linkTo: {
                pathname: "/vessel-detail",
                params: { id: task.vesselId },
              },
            },
            {
              label: "Assigned To",
              value: task.assignedToName || "Unassigned",
              icon: {
                ios_icon_name: "person.fill",
                android_material_icon_name: "person",
              },
            },
          ]}
        />

        {!task.assignedToName && task.status !== "completed" && userRole !== "owner" && (
          <DetailRow
            button={{
              label: "Assign to Crew",
              onPress: handleAssign,
              color: colors.text,
            }}
          />
        )}

        {userRole !== "owner" && task.status !== "completed" && (
          <>
            <DropdownRow
              label="Priority"
              options={[
                { label: "Urgent", value: "urgent" },
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ]}
              selectedValue={task.priority}
              onSelect={(value) => handlePriorityChange(value as TaskPriority)}
            />
            <DropdownRow
              label="Status"
              options={[
                { label: "Open", value: "open" },
                { label: "In Progress", value: "in_progress" },
                { label: "Waiting on Parts", value: "waiting_on_parts" },
              ]}
              selectedValue={task.status}
              onSelect={(value) => handleStatusChange(value as TaskStatus)}
            />
          </>
        )}

        <DetailRow
          label="Due Date"
          inline
          value={formatDueDate(task.dueDate)}
          valueColor={
            isOverdue(task.dueDate) && task.status !== "completed"
              ? colors.danger
              : undefined
          }
        />
        {task.isRecurring && (
          <DetailRow
            label="Frequency"
            inline
            value={`Every ${task.frequencyValue} ${task.frequency}`}
          />
        )}
        {task.estimatedCost && (
          <DetailRow
            label="Estimated Cost"
            inline
            value={`$${task.estimatedCost.toLocaleString()}`}
          />
        )}
        {task.actualCost && (
          <DetailRow
            label="Actual Cost"
            inline
            value={`$${task.actualCost.toLocaleString()}`}
          />
        )}
        <DetailRow label="Description" value={task.description} />
        {task.notes && <DetailRow label="Notes" value={task.notes} />}

        {userRole !== "owner" && task.status !== "completed" && (
          <DetailRow
            button={{
              label: "Mark as Complete",
              onPress: handleComplete,
              color: colors.success,
            }}
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
                {MOCK_USERS[task.createdBy] || "Unknown"} created this task
              </Text>
              <Text style={styles.commentDate}>
                {formatDate(new Date(task.createdAt))}
              </Text>
            </View>
          </View>

          {(task.comments || []).map((comment) => (
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
    marginTop: 8,
    backgroundColor: colors.surfaceOne,
    borderTopWidth: 1,
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
    backgroundColor: colors.surfaceOne,
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
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    padding: 6,
    backgroundColor: colors.text,
    borderRadius: 8,
  },
  sendButtonDisabled: { opacity: 0.5 },
});
