
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { formatDate, formatDueDate, isOverdue } from '@/utils/dateUtils';
import { TaskStatus, TaskPriority } from '@/types';

export default function MaintenanceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { maintenanceTasks, updateMaintenanceTask, completeMaintenanceTask } = useData();
  const { userRole, userId, userName } = useAuth();
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');

  const task = maintenanceTasks.find(t => t.id === id);

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>Task not found</Text>
      </View>
    );
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return colors.danger;
      case 'high': return colors.warning;
      case 'medium': return colors.accent;
      case 'low': return colors.success;
      default: return colors.grey;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.accent;
      case 'waiting_on_parts': return colors.warning;
      case 'open': return colors.grey;
      default: return colors.grey;
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateMaintenanceTask(task.id, { status: newStatus });
    Alert.alert('Success', `Task status updated to ${newStatus}`);
  };

  const handleComplete = () => {
    if (!userId || !userName) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    Alert.alert(
      'Complete Task',
      'Mark this task as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            completeMaintenanceTask(task.id, {
              completedBy: userId,
              completedByName: userName,
              completedAt: new Date(),
              notes: notes || 'Task completed',
              attachments: [],
              cost: cost ? parseFloat(cost) : undefined,
            });
            Alert.alert('Success', 'Task completed successfully');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Task Details' }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{task.title}</Text>
          <View style={styles.badges}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '30' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                {task.priority.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '30' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                {task.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <IconSymbol 
                ios_icon_name="sailboat.fill" 
                android_material_icon_name="sailing" 
                size={20} 
                color={colors.accent} 
              />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Vessel</Text>
                <Text style={styles.detailValue}>{task.vesselName}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <IconSymbol 
                ios_icon_name="calendar" 
                android_material_icon_name="event" 
                size={20} 
                color={isOverdue(task.dueDate) && task.status !== 'completed' ? colors.danger : colors.accent} 
              />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={[
                  styles.detailValue,
                  isOverdue(task.dueDate) && task.status !== 'completed' && styles.overdueText
                ]}>
                  {formatDueDate(task.dueDate)}
                </Text>
              </View>
            </View>

            {task.assignedToName && (
              <View style={styles.detailItem}>
                <IconSymbol 
                  ios_icon_name="person.fill" 
                  android_material_icon_name="person" 
                  size={20} 
                  color={colors.accent} 
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Assigned To</Text>
                  <Text style={styles.detailValue}>{task.assignedToName}</Text>
                </View>
              </View>
            )}

            {task.isRecurring && (
              <View style={styles.detailItem}>
                <IconSymbol 
                  ios_icon_name="arrow.clockwise" 
                  android_material_icon_name="repeat" 
                  size={20} 
                  color={colors.accent} 
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Frequency</Text>
                  <Text style={styles.detailValue}>
                    Every {task.frequencyValue} {task.frequency}
                  </Text>
                </View>
              </View>
            )}

            {task.estimatedCost && (
              <View style={styles.detailItem}>
                <IconSymbol 
                  ios_icon_name="dollarsign.circle" 
                  android_material_icon_name="attach_money" 
                  size={20} 
                  color={colors.success} 
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Estimated Cost</Text>
                  <Text style={styles.detailValue}>${task.estimatedCost.toLocaleString()}</Text>
                </View>
              </View>
            )}

            {task.actualCost && (
              <View style={styles.detailItem}>
                <IconSymbol 
                  ios_icon_name="dollarsign.circle.fill" 
                  android_material_icon_name="payments" 
                  size={20} 
                  color={colors.success} 
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Actual Cost</Text>
                  <Text style={styles.detailValue}>${task.actualCost.toLocaleString()}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {task.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{task.notes}</Text>
          </View>
        )}

        {task.completionHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completion History</Text>
            {task.completionHistory.map((record, index) => (
              <View key={record.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={24} 
                    color={colors.success} 
                  />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>{record.completedByName}</Text>
                    <Text style={styles.historyDate}>{formatDate(record.completedAt)}</Text>
                  </View>
                </View>
                {record.notes && (
                  <Text style={styles.historyNotes}>{record.notes}</Text>
                )}
                {record.cost && (
                  <Text style={styles.historyCost}>Cost: ${record.cost.toLocaleString()}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {userRole !== 'owner' && task.status !== 'completed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Status</Text>
            <View style={styles.statusButtons}>
              {['open', 'in_progress', 'waiting_on_parts'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    task.status === status && styles.statusButtonActive,
                  ]}
                  onPress={() => handleStatusChange(status as TaskStatus)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    task.status === status && styles.statusButtonTextActive,
                  ]}>
                    {status.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {userRole !== 'owner' && task.status !== 'completed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Complete Task</Text>
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
            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check_circle" 
                size={24} 
                color={colors.text} 
              />
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  overdueText: {
    color: colors.danger,
  },
  notesText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '600',
    color: colors.success,
    marginTop: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusButtonTextActive: {
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 100,
  },
});
