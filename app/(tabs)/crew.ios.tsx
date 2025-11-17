
import React, { useState } from "react";
import { Stack } from "expo-router";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { IconSymbol } from "@/components/IconSymbol.ios";
import { router } from "expo-router";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueTime: string;
}

export default function CrewDashboard() {
  const theme = useTheme();
  const { userName, setUserRole } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Deck Cleaning", description: "Clean and polish main deck area", priority: "high", completed: false, dueTime: "10:00 AM" },
    { id: 2, title: "Safety Equipment Check", description: "Inspect life jackets and fire extinguishers", priority: "high", completed: false, dueTime: "11:30 AM" },
    { id: 3, title: "Engine Room Inspection", description: "Check oil levels and temperature gauges", priority: "medium", completed: false, dueTime: "2:00 PM" },
    { id: 4, title: "Inventory Count", description: "Count and log cleaning supplies", priority: "low", completed: true, dueTime: "Completed" },
    { id: 5, title: "Guest Cabin Preparation", description: "Prepare cabins for incoming guests", priority: "medium", completed: false, dueTime: "4:00 PM" },
  ]);

  const handleLogout = () => {
    console.log('Logging out');
    setUserRole(null);
    router.replace('/(tabs)/(home)/');
  };

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    console.log('Task toggled:', taskId);
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const supplyRequests = [
    { id: 1, item: "Cleaning Supplies", quantity: "5 units", status: "Pending" },
    { id: 2, item: "Engine Oil", quantity: "20L", status: "Approved" },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Crew Dashboard",
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 8 }}>
              <IconSymbol 
                ios_icon_name="rectangle.portrait.and.arrow.right" 
                android_material_icon_name="logout" 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Crew Portal</Text>
                <Text style={commonStyles.title}>{userName}</Text>
              </View>
            </View>
            <View style={styles.roleTag}>
              <IconSymbol 
                ios_icon_name="person.2.fill" 
                android_material_icon_name="groups" 
                size={16} 
                color={colors.success} 
              />
              <Text style={styles.roleText}>Crew Member</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingTasks.length}</Text>
              <Text style={styles.statLabel}>Pending Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{completedTasks.length}</Text>
              <Text style={styles.statLabel}>Completed Today</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingTasks.length}</Text>
              </View>
            </View>

            {tasks.map((task) => (
              <TouchableOpacity 
                key={task.id}
                style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
                onPress={() => toggleTaskCompletion(task.id)}
                activeOpacity={0.7}
              >
                <View style={styles.taskCheckbox}>
                  {task.completed ? (
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={28} 
                      color={colors.success} 
                    />
                  ) : (
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="radio_button_unchecked" 
                      size={28} 
                      color={colors.textSecondary} 
                    />
                  )}
                </View>
                <View style={styles.taskContent}>
                  <View style={styles.taskHeader}>
                    <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                      {task.title}
                    </Text>
                    <View style={[
                      styles.priorityBadge,
                      task.priority === 'high' ? styles.priorityHigh :
                      task.priority === 'medium' ? styles.priorityMedium :
                      styles.priorityLow
                    ]}>
                      <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={[styles.taskDescription, task.completed && styles.taskDescriptionCompleted]}>
                    {task.description}
                  </Text>
                  <View style={styles.taskFooter}>
                    <IconSymbol 
                      ios_icon_name="clock" 
                      android_material_icon_name="schedule" 
                      size={16} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.taskTime}>{task.dueTime}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supply Requests</Text>
            {supplyRequests.map((request) => (
              <View key={request.id} style={styles.supplyCard}>
                <View style={styles.supplyHeader}>
                  <IconSymbol 
                    ios_icon_name="shippingbox.fill" 
                    android_material_icon_name="inventory_2" 
                    size={24} 
                    color={colors.accent} 
                  />
                  <View style={styles.supplyInfo}>
                    <Text style={styles.supplyItem}>{request.item}</Text>
                    <Text style={styles.supplyQuantity}>{request.quantity}</Text>
                  </View>
                </View>
                <View style={[
                  styles.supplyStatus,
                  request.status === 'Approved' ? styles.supplyStatusApproved : styles.supplyStatusPending
                ]}>
                  <Text style={[
                    styles.supplyStatusText,
                    request.status === 'Approved' ? styles.supplyStatusTextApproved : styles.supplyStatusTextPending
                  ]}>{request.status}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol 
                ios_icon_name="exclamationmark.triangle.fill" 
                android_material_icon_name="report_problem" 
                size={24} 
                color={colors.text} 
              />
              <Text style={styles.actionButtonText}>Report Issue</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol 
                ios_icon_name="plus.circle.fill" 
                android_material_icon_name="add_circle" 
                size={24} 
                color={colors.text} 
              />
              <Text style={styles.actionButtonText}>Request Supplies</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol 
                ios_icon_name="camera.fill" 
                android_material_icon_name="photo_camera" 
                size={24} 
                color={colors.text} 
              />
              <Text style={styles.actionButtonText}>Upload Photo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  roleText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardCompleted: {
    opacity: 0.6,
    borderColor: colors.success,
  },
  taskCheckbox: {
    marginRight: 12,
    paddingTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  taskDescriptionCompleted: {
    textDecorationLine: 'line-through',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityHigh: {
    backgroundColor: colors.danger + '30',
  },
  priorityMedium: {
    backgroundColor: colors.warning + '30',
  },
  priorityLow: {
    backgroundColor: colors.success + '30',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  supplyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  supplyInfo: {
    flex: 1,
  },
  supplyItem: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  supplyQuantity: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  supplyStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  supplyStatusApproved: {
    backgroundColor: colors.success + '30',
  },
  supplyStatusPending: {
    backgroundColor: colors.warning + '30',
  },
  supplyStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  supplyStatusTextApproved: {
    color: colors.success,
  },
  supplyStatusTextPending: {
    color: colors.warning,
  },
  quickActions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
