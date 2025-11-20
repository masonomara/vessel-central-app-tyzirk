
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { Issue, TaskStatus, TaskPriority } from '@/types';
import { formatDate } from '@/utils/dateUtils';

export default function IssuesScreen() {
  const theme = useTheme();
  const { issues } = useData();
  const { userRole } = useAuth();
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIssues = issues.filter(issue => {
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

  const handleIssuePress = (issue: Issue) => {
    console.log('Issue pressed:', issue.id);
    // Navigate to issue detail screen
  };

  const handleAddIssue = () => {
    console.log('Add issue pressed');
    // Navigate to add issue screen
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Issues</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddIssue}>
          <IconSymbol 
            ios_icon_name="plus.circle.fill" 
            android_material_icon_name="add_circle" 
            size={32} 
            color={colors.danger} 
          />
        </TouchableOpacity>
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
          placeholder="Search issues..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {['all', 'open', 'in_progress', 'waiting_on_parts', 'completed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              filterStatus === status && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus(status as TaskStatus | 'all')}
          >
            <Text style={[
              styles.filterChipText,
              filterStatus === status && styles.filterChipTextActive,
            ]}>
              {status.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredIssues.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol 
              ios_icon_name="checkmark.circle" 
              android_material_icon_name="check_circle" 
              size={64} 
              color={colors.success} 
            />
            <Text style={styles.emptyStateText}>No issues found</Text>
            <Text style={styles.emptyStateSubtext}>All systems running smoothly!</Text>
          </View>
        ) : (
          filteredIssues.map((issue) => (
            <TouchableOpacity
              key={issue.id}
              style={[
                styles.issueCard,
                issue.priority === 'urgent' && styles.issueCardUrgent,
              ]}
              onPress={() => handleIssuePress(issue)}
              activeOpacity={0.7}
            >
              <View style={styles.issueHeader}>
                <View style={styles.issueTitleRow}>
                  <IconSymbol 
                    ios_icon_name="exclamationmark.triangle.fill" 
                    android_material_icon_name="report_problem" 
                    size={24} 
                    color={getPriorityColor(issue.priority)} 
                  />
                  <Text style={styles.issueTitle}>{issue.title}</Text>
                </View>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(issue.priority) + '30' },
                ]}>
                  <Text style={[
                    styles.priorityText,
                    { color: getPriorityColor(issue.priority) },
                  ]}>
                    {issue.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.issueDescription} numberOfLines={2}>
                {issue.description}
              </Text>

              <View style={styles.issueMeta}>
                <View style={styles.metaItem}>
                  <IconSymbol 
                    ios_icon_name="sailboat.fill" 
                    android_material_icon_name="sailing" 
                    size={16} 
                    color={colors.textSecondary} 
                  />
                  <Text style={styles.metaText}>{issue.vesselName}</Text>
                </View>
                <View style={styles.metaItem}>
                  <IconSymbol 
                    ios_icon_name="location.fill" 
                    android_material_icon_name="location_on" 
                    size={16} 
                    color={colors.textSecondary} 
                  />
                  <Text style={styles.metaText}>{issue.location}</Text>
                </View>
              </View>

              <View style={styles.issueFooter}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(issue.status) + '30' },
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(issue.status) },
                  ]}>
                    {issue.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.reportedBy}>
                  <Text style={styles.reportedByText}>
                    Reported by {issue.reportedByName}
                  </Text>
                  <Text style={styles.timeText}>{formatDate(issue.createdAt)}</Text>
                </View>
              </View>

              {issue.attachments.length > 0 && (
                <View style={styles.attachmentsIndicator}>
                  <IconSymbol 
                    ios_icon_name="paperclip" 
                    android_material_icon_name="attach_file" 
                    size={16} 
                    color={colors.accent} 
                  />
                  <Text style={styles.attachmentsText}>
                    {issue.attachments.length} attachment{issue.attachments.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {issue.comments.length > 0 && (
                <View style={styles.commentsIndicator}>
                  <IconSymbol 
                    ios_icon_name="bubble.left.fill" 
                    android_material_icon_name="comment" 
                    size={16} 
                    color={colors.accent} 
                  />
                  <Text style={styles.commentsText}>
                    {issue.comments.length} comment{issue.comments.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  addButton: {
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
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.text,
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  issueCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  issueCardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  issueTitle: {
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
  issueDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  issueMeta: {
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
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  reportedBy: {
    alignItems: 'flex-end',
  },
  reportedByText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timeText: {
    fontSize: 11,
    color: colors.grey,
    marginTop: 2,
  },
  attachmentsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachmentsText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  commentsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  commentsText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
});
