
import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import FilterModal, { FilterOptions } from '@/components/FilterModal';
import { MaintenanceTask, TaskStatus, TaskPriority } from '@/types';
import { formatDueDate, isOverdue } from '@/utils/dateUtils';
import { router } from 'expo-router';

export default function MaintenanceScreen() {
  const theme = useTheme();
  const { maintenanceTasks, updateMaintenanceTask } = useData();
  const { userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    dateRange: 'all',
  });

  const filteredTasks = useMemo(() => {
    return maintenanceTasks.filter(task => {
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesDate = true;
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const taskDate = new Date(task.dueDate);
        
        if (filters.dateRange === 'today') {
          matchesDate = taskDate.toDateString() === now.toDateString();
        } else if (filters.dateRange === 'week') {
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          matchesDate = taskDate <= weekFromNow;
        } else if (filters.dateRange === 'month') {
          const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          matchesDate = taskDate <= monthFromNow;
        }
      }

      return matchesStatus && matchesPriority && matchesSearch && matchesDate;
    });
  }, [maintenanceTasks, filters, searchQuery]);

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

  const handleTaskPress = (task: MaintenanceTask) => {
    console.log('Task pressed:', task.id);
    router.push(`/maintenance-detail?id=${task.id}`);
  };

  const handleAddTask = () => {
    console.log('Add task pressed');
    router.push('/add-maintenance-task');
  };

  const handleAnalytics = () => {
    console.log('Analytics pressed');
    router.push('/analytics');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') {
      count++;
    }
    if (filters.priority !== 'all') {
      count++;
    }
    if (filters.dateRange !== 'all') {
      count++;
    }
    return count;
  }, [filters]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Maintenance</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleAnalytics}>
            <IconSymbol 
              ios_icon_name="chart.bar.fill" 
              android_material_icon_name="analytics" 
              size={24} 
              color={colors.accent} 
            />
          </TouchableOpacity>
          {(userRole === 'manager' || userRole === 'owner') && (
            <TouchableOpacity style={styles.iconButton} onPress={handleAddTask}>
              <IconSymbol 
                ios_icon_name="plus.circle.fill" 
                android_material_icon_name="add_circle" 
                size={32} 
                color={colors.accent} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol 
          ios_icon_name="magnifyingglass" 
          android_material_icon_name="search" 
          size={20} 
          color={colors.textSecondary} 
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <IconSymbol 
            ios_icon_name="line.3.horizontal.decrease.circle" 
            android_material_icon_name="filter_list" 
            size={24} 
            color={activeFilterCount > 0 ? colors.accent : colors.textSecondary} 
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{filteredTasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {filteredTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {filteredTasks.filter(t => t.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol 
              ios_icon_name="wrench.and.screwdriver" 
              android_material_icon_name="build" 
              size={64} 
              color={colors.textSecondary} 
            />
            <Text style={styles.emptyStateText}>No maintenance tasks found</Text>
            {(userRole === 'manager' || userRole === 'owner') && (
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddTask}>
                <Text style={styles.emptyStateButtonText}>Create First Task</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskCard,
                isOverdue(task.dueDate) && task.status !== 'completed' && styles.taskCardOverdue,
              ]}
              onPress={() => handleTaskPress(task)}
              activeOpacity={0.7}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleRow}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.isRecurring && (
                    <IconSymbol 
                      ios_icon_name="arrow.clockwise" 
                      android_material_icon_name="repeat" 
                      size={16} 
                      color={colors.accent} 
                    />
                  )}
                </View>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(task.priority) + '30' },
                ]}>
                  <Text style={[
                    styles.priorityText,
                    { color: getPriorityColor(task.priority) },
                  ]}>
                    {task.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.taskDescription} numberOfLines={2}>
                {task.description}
              </Text>

              <View style={styles.taskMeta}>
                <View style={styles.metaItem}>
                  <IconSymbol 
                    ios_icon_name="sailboat.fill" 
                    android_material_icon_name="sailing" 
                    size={16} 
                    color={colors.textSecondary} 
                  />
                  <Text style={styles.metaText}>{task.vesselName}</Text>
                </View>
                {task.assignedToName && (
                  <View style={styles.metaItem}>
                    <IconSymbol 
                      ios_icon_name="person.fill" 
                      android_material_icon_name="person" 
                      size={16} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.metaText}>{task.assignedToName}</Text>
                  </View>
                )}
              </View>

              <View style={styles.taskFooter}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(task.status) + '30' },
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(task.status) },
                  ]}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.dueDateContainer}>
                  <IconSymbol 
                    ios_icon_name="calendar" 
                    android_material_icon_name="event" 
                    size={16} 
                    color={isOverdue(task.dueDate) && task.status !== 'completed' ? colors.danger : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.dueDateText,
                    isOverdue(task.dueDate) && task.status !== 'completed' && styles.dueDateOverdue,
                  ]}>
                    {formatDueDate(task.dueDate)}
                  </Text>
                </View>
              </View>

              {task.estimatedCost && (
                <View style={styles.costContainer}>
                  <Text style={styles.costLabel}>Est. Cost:</Text>
                  <Text style={styles.costValue}>${task.estimatedCost.toLocaleString()}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={setFilters}
        filterType="maintenance"
        currentFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    padding: 4,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueDateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  dueDateOverdue: {
    color: colors.danger,
    fontWeight: '600',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  costLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 8,
  },
  costValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
});
