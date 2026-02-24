import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TextInput,
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

import { DetailNotFound } from "../components/DetailNotFound";
import { formatDate, formatDueDate, isOverdue } from "../utils/dateUtils";
import { TaskStatus, TaskPriority } from "../types";
import { useTopPadding } from "../hooks/useTopPadding";

export default function MaintenanceDetailScreen() {
  const topPadding = useTopPadding();
  const { id } = useLocalSearchParams();
  const { maintenanceTasks, updateMaintenanceTask, completeMaintenanceTask } =
    useData();
  const { userRole, userId, userName } = useAuth();
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");

  const task = maintenanceTasks.find((t) => t.id === id);

  if (!task) {
    return <DetailNotFound title="Task Not Found" />;
  }

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateMaintenanceTask(task.id, { status: newStatus });
    Alert.alert("Success", `Task status updated to ${newStatus}`);
  };

  const handleComplete = () => {
    if (!userId || !userName) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    Alert.alert("Complete Task", "Mark this task as completed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: () => {
          completeMaintenanceTask(task.id, {
            completedBy: userId,
            completedByName: userName,
            completedAt: new Date(),
            notes: notes || "Task completed",
            attachments: [],
            cost: cost ? parseFloat(cost) : undefined,
          });
          Alert.alert("Success", "Task completed successfully");
          router.back();
        },
      },
    ]);
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
        contentContainerStyle={[ds.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{task.title}</Text>
        </View>

        <DetailRow label="Description" value={task.description} />
        <DetailRow
          label="Vessel"
          value={task.vesselName}
          linkTo={{ pathname: "/vessel-detail", params: { id: task.vesselId } }}
        />
        <DetailRow
          label="Due Date"
          value={formatDueDate(task.dueDate)}
          valueColor={
            isOverdue(task.dueDate) && task.status !== "completed"
              ? colors.danger
              : undefined
          }
        />
        {task.assignedToName && (
          <DetailRow label="Assigned To" value={task.assignedToName} />
        )}
        {task.isRecurring && (
          <DetailRow
            label="Frequency"
            value={`Every ${task.frequencyValue} ${task.frequency}`}
          />
        )}
        {task.estimatedCost && (
          <DetailRow
            label="Estimated Cost"
            value={`$${task.estimatedCost.toLocaleString()}`}
          />
        )}
        {task.actualCost && (
          <DetailRow
            label="Actual Cost"
            value={`$${task.actualCost.toLocaleString()}`}
          />
        )}

        {task.notes && <DetailRow label="Notes" value={task.notes} />}

        {task.completionHistory.length > 0 && (
          <View style={ds.section}>
            <Text style={ds.sectionTitle}>Completion History</Text>
            {task.completionHistory.map((record) => (
              <View key={record.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={24}
                    color={colors.success}
                  />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>
                      {record.completedByName}
                    </Text>
                    <Text style={styles.historyDate}>
                      {formatDate(record.completedAt)}
                    </Text>
                  </View>
                </View>
                {record.notes && (
                  <Text style={styles.historyNotes}>{record.notes}</Text>
                )}
                {record.cost && (
                  <Text style={styles.historyCost}>
                    Cost: ${record.cost.toLocaleString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {userRole !== "owner" && task.status !== "completed" && (
          <>
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
            <DropdownRow
              label="Priority"
              options={[
                { label: "Urgent", value: "urgent" },
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ]}
              selectedValue={task.priority}
              onSelect={(value) =>
                updateMaintenanceTask(task.id, {
                  priority: value as TaskPriority,
                })
              }
            />
          </>
        )}

        {userRole !== "owner" && task.status !== "completed" && (
          <>
            <View style={styles.formSection}>
              <TextInput
                style={styles.input}
                placeholder="Completion notes..."
                placeholderTextColor={colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
              <TextInput
                style={styles.input}
                placeholder="Actual cost (optional)"
                placeholderTextColor={colors.textSecondary}
                value={cost}
                onChangeText={setCost}
                keyboardType="numeric"
              />
            </View>
            <DetailRow
              label="Complete Task"
              button={{
                label: "Mark as Complete",
                onPress: handleComplete,
                color: colors.success,
              }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    backgroundColor: colors.surfaceOne,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  historyDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  historyCost: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.success,
    marginTop: 8,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  input: {
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
});
