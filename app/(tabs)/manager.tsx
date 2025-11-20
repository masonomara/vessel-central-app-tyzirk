
import React, { useMemo } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { IconSymbol } from "@/components/IconSymbol";
import { router } from "expo-router";

export default function ManagerDashboard() {
  const theme = useTheme();
  const { userName, userId, userRole, setUserRole } = useAuth();
  const { 
    getVesselsForUser, 
    getMaintenanceTasksForUser,
    getSupplyRequestsForUser,
    getIssuesForUser
  } = useData();

  const handleLogout = () => {
    console.log('Logging out');
    setUserRole(null);
    router.replace('/(tabs)/(home)/');
  };

  const myVessels = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getVesselsForUser(userId, userRole);
  }, [userId, userRole, getVesselsForUser]);

  const myMaintenanceTasks = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getMaintenanceTasksForUser(userId, userRole);
  }, [userId, userRole, getMaintenanceTasksForUser]);

  const mySupplyRequests = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getSupplyRequestsForUser(userId, userRole);
  }, [userId, userRole, getSupplyRequestsForUser]);

  const myIssues = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getIssuesForUser(userId, userRole);
  }, [userId, userRole, getIssuesForUser]);

  const pendingApprovals = useMemo(() => {
    return mySupplyRequests.filter(req => req.status === 'pending');
  }, [mySupplyRequests]);

  const upcomingMaintenance = useMemo(() => {
    return myMaintenanceTasks
      .filter(task => task.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  }, [myMaintenanceTasks]);

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Manager Portal</Text>
              <Text style={commonStyles.title}>{userName}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <IconSymbol 
                ios_icon_name="rectangle.portrait.and.arrow.right" 
                android_material_icon_name="logout" 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.roleTag}>
            <IconSymbol 
              ios_icon_name="chart.bar.fill" 
              android_material_icon_name="dashboard" 
              size={16} 
              color={colors.accent} 
            />
            <Text style={styles.roleText}>Manager</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fleet Overview ({myVessels.length})</Text>
          {myVessels.map((vessel) => {
            const vesselTasks = myMaintenanceTasks.filter(t => t.vesselId === vessel.id && t.status !== 'completed');
            const vesselIssues = myIssues.filter(i => i.vesselId === vessel.id && i.status !== 'completed');
            
            return (
              <View key={vessel.id} style={styles.vesselCard}>
                <View style={styles.vesselHeader}>
                  <IconSymbol 
                    ios_icon_name="sailboat.fill" 
                    android_material_icon_name="sailing" 
                    size={28} 
                    color={colors.accent} 
                  />
                  <View style={styles.vesselInfo}>
                    <Text style={styles.vesselName}>{vessel.name}</Text>
                    <View style={styles.vesselMeta}>
                      <View style={[
                        styles.statusBadge, 
                        vessel.status === 'active' ? styles.statusActive : styles.statusMaintenance
                      ]}>
                        <Text style={[
                          styles.statusText,
                          vessel.status === 'active' ? styles.statusTextActive : styles.statusTextMaintenance
                        ]}>{vessel.status.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.vesselStats}>
                  <View style={styles.statItem}>
                    <IconSymbol 
                      ios_icon_name="person.2.fill" 
                      android_material_icon_name="groups" 
                      size={18} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.statText}>{vessel.crewCount} Crew</Text>
                  </View>
                  <View style={styles.statItem}>
                    <IconSymbol 
                      ios_icon_name="list.bullet" 
                      android_material_icon_name="list" 
                      size={18} 
                      color={colors.warning} 
                    />
                    <Text style={styles.statText}>{vesselTasks.length} Tasks</Text>
                  </View>
                  <View style={styles.statItem}>
                    <IconSymbol 
                      ios_icon_name="exclamationmark.triangle" 
                      android_material_icon_name="warning" 
                      size={18} 
                      color={colors.danger} 
                    />
                    <Text style={styles.statText}>{vesselIssues.length} Issues</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Approvals</Text>
            {pendingApprovals.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingApprovals.length}</Text>
              </View>
            )}
          </View>
          {pendingApprovals.length > 0 ? (
            pendingApprovals.map((approval) => (
              <View key={approval.id} style={styles.approvalCard}>
                <View style={styles.approvalHeader}>
                  <View style={styles.approvalType}>
                    <Text style={styles.approvalTypeText}>{approval.category}</Text>
                  </View>
                  <Text style={styles.approvalAmount}>${approval.estimatedCost}</Text>
                </View>
                <Text style={styles.approvalTitle}>{approval.itemName}</Text>
                <Text style={styles.approvalVessel}>{approval.vesselName}</Text>
                <Text style={styles.approvalDescription}>{approval.description}</Text>
                <View style={styles.approvalActions}>
                  <TouchableOpacity style={styles.approveButton}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.success} 
                    />
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton}>
                    <IconSymbol 
                      ios_icon_name="xmark.circle.fill" 
                      android_material_icon_name="cancel" 
                      size={20} 
                      color={colors.danger} 
                    />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No pending approvals</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maintenance Schedule</Text>
          {upcomingMaintenance.length > 0 ? (
            upcomingMaintenance.map((item) => (
              <View key={item.id} style={styles.maintenanceCard}>
                <View style={styles.maintenanceHeader}>
                  <IconSymbol 
                    ios_icon_name="wrench.and.screwdriver.fill" 
                    android_material_icon_name="build" 
                    size={24} 
                    color={
                      item.priority === 'high' || item.priority === 'urgent' ? colors.danger :
                      item.priority === 'medium' ? colors.warning :
                      colors.success
                    }
                  />
                  <View style={styles.maintenanceInfo}>
                    <Text style={styles.maintenanceTask}>{item.title}</Text>
                    <Text style={styles.maintenanceVessel}>{item.vesselName}</Text>
                  </View>
                </View>
                <View style={styles.maintenanceMeta}>
                  <View style={[
                    styles.priorityBadge,
                    item.priority === 'high' || item.priority === 'urgent' ? styles.priorityHigh :
                    item.priority === 'medium' ? styles.priorityMedium :
                    styles.priorityLow
                  ]}>
                    <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.dueDate}>Due in {getDaysUntil(item.dueDate)} days</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming maintenance</Text>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol 
              ios_icon_name="person.badge.plus.fill" 
              android_material_icon_name="person_add" 
              size={24} 
              color={colors.text} 
            />
            <Text style={styles.actionButtonText}>Add Crew</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol 
              ios_icon_name="calendar.badge.plus" 
              android_material_icon_name="event_available" 
              size={24} 
              color={colors.text} 
            />
            <Text style={styles.actionButtonText}>Schedule Task</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol 
              ios_icon_name="doc.text.fill" 
              android_material_icon_name="description" 
              size={24} 
              color={colors.text} 
            />
            <Text style={styles.actionButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
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
  logoutButton: {
    padding: 8,
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
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: colors.danger,
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
  vesselCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vesselHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  vesselInfo: {
    flex: 1,
  },
  vesselName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  vesselMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: colors.success + '30',
  },
  statusMaintenance: {
    backgroundColor: colors.warning + '30',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextMaintenance: {
    color: colors.warning,
  },
  vesselStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  approvalCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvalType: {
    backgroundColor: colors.accent + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  approvalTypeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  approvalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  approvalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  approvalVessel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  approvalDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success + '30',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  approveButtonText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger + '30',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  rejectButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  maintenanceCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceTask: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  maintenanceVessel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  maintenanceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  dueDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
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
