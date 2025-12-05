
import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { TaskStatus, TaskPriority, SupplyRequestStatus } from '@/types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  filterType: 'maintenance' | 'issues' | 'supplies';
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  status?: TaskStatus | SupplyRequestStatus | 'all';
  priority?: TaskPriority | 'all';
  dateRange?: 'today' | 'week' | 'month' | 'all';
  vessel?: string | 'all';
}

export default function FilterModal({ visible, onClose, onApply, filterType, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      status: 'all',
      priority: 'all',
      dateRange: 'all',
      vessel: 'all',
    };
    setFilters(resetFilters);
  };

  const getStatusOptions = () => {
    if (filterType === 'supplies') {
      return ['all', 'pending', 'approved', 'denied', 'ordered', 'received'];
    }
    return ['all', 'open', 'in_progress', 'waiting_on_parts', 'completed'];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol 
                ios_icon_name="xmark" 
                android_material_icon_name="close" 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                {getStatusOptions().map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      filters.status === status && styles.filterChipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, status: status as any })}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.status === status && styles.filterChipTextActive,
                    ]}>
                      {status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {filterType !== 'supplies' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Priority</Text>
                <View style={styles.filterOptions}>
                  {['all', 'low', 'medium', 'high', 'urgent'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.filterChip,
                        filters.priority === priority && styles.filterChipActive,
                      ]}
                      onPress={() => setFilters({ ...filters, priority: priority as any })}
                    >
                      <Text style={[
                        styles.filterChipText,
                        filters.priority === priority && styles.filterChipTextActive,
                      ]}>
                        {priority.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.filterOptions}>
                {['all', 'today', 'week', 'month'].map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.filterChip,
                      filters.dateRange === range && styles.filterChipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, dateRange: range as any })}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.dateRange === range && styles.filterChipTextActive,
                    ]}>
                      {range.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  applyButton: {
    flex: 2,
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
