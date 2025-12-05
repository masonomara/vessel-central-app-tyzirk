
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { offlineManager, QueueStatus } from '@/utils/offlineManager';

export function OfflineQueueStatus() {
  const [status, setStatus] = useState<QueueStatus>({
    totalActions: 0,
    pendingActions: 0,
    failedActions: 0,
    isOnline: true,
    isSyncing: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to status updates
    const unsubscribe = offlineManager.subscribe(setStatus);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleOpenModal = async () => {
    const queueData = await offlineManager.getOfflineQueue();
    setQueue(queueData);
    setShowModal(true);
  };

  const handleSync = async () => {
    await offlineManager.syncOfflineQueue();
    const queueData = await offlineManager.getOfflineQueue();
    setQueue(queueData);
  };

  const handleRetry = async (actionId: string) => {
    await offlineManager.retryAction(actionId);
    const queueData = await offlineManager.getOfflineQueue();
    setQueue(queueData);
  };

  const handleClearFailed = async () => {
    await offlineManager.clearFailedActions();
    const queueData = await offlineManager.getOfflineQueue();
    setQueue(queueData);
  };

  // Don't show if online and no pending actions
  if (status.isOnline && status.totalActions === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <TouchableOpacity style={styles.banner} onPress={handleOpenModal}>
        <View style={styles.bannerContent}>
          <IconSymbol
            ios_icon_name={status.isOnline ? 'wifi' : 'wifi.slash'}
            android_material_icon_name={status.isOnline ? 'wifi' : 'wifi_off'}
            size={20}
            color={status.isOnline ? colors.success : colors.warning}
          />
          
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>
              {status.isOnline ? 'Online' : 'Offline Mode'}
            </Text>
            {status.totalActions > 0 && (
              <Text style={styles.bannerSubtitle}>
                {status.pendingActions} pending action{status.pendingActions !== 1 ? 's' : ''}
                {status.failedActions > 0 && ` • ${status.failedActions} failed`}
              </Text>
            )}
          </View>

          {status.isSyncing && (
            <ActivityIndicator size="small" color={colors.accent} />
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Offline Queue</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={[styles.statusValue, { color: status.isOnline ? colors.success : colors.warning }]}>
                  {status.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Total Actions:</Text>
                <Text style={styles.statusValue}>{status.totalActions}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Pending:</Text>
                <Text style={styles.statusValue}>{status.pendingActions}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Failed:</Text>
                <Text style={[styles.statusValue, { color: status.failedActions > 0 ? colors.danger : colors.text }]}>
                  {status.failedActions}
                </Text>
              </View>
            </View>

            {status.isOnline && status.totalActions > 0 && (
              <TouchableOpacity
                style={styles.syncButton}
                onPress={handleSync}
                disabled={status.isSyncing}
              >
                {status.isSyncing ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <React.Fragment>
                    <IconSymbol
                      ios_icon_name="arrow.clockwise"
                      android_material_icon_name="sync"
                      size={20}
                      color={colors.text}
                    />
                    <Text style={styles.syncButtonText}>Sync Now</Text>
                  </React.Fragment>
                )}
              </TouchableOpacity>
            )}

            {status.failedActions > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearFailed}>
                <IconSymbol
                  ios_icon_name="trash.fill"
                  android_material_icon_name="delete"
                  size={20}
                  color={colors.danger}
                />
                <Text style={styles.clearButtonText}>Clear Failed Actions</Text>
              </TouchableOpacity>
            )}

            <ScrollView style={styles.queueList}>
              {queue.length === 0 ? (
                <View style={styles.emptyState}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check_circle"
                    size={48}
                    color={colors.success}
                  />
                  <Text style={styles.emptyStateText}>No pending actions</Text>
                </View>
              ) : (
                queue.map((action, index) => (
                  <View key={action.id} style={styles.queueItem}>
                    <View style={styles.queueItemHeader}>
                      <Text style={styles.queueItemTitle}>
                        {action.type.toUpperCase()} {action.entity}
                      </Text>
                      <Text style={[
                        styles.queueItemStatus,
                        { color: action.retryCount >= 5 ? colors.danger : colors.warning }
                      ]}>
                        {action.retryCount >= 5 ? 'Failed' : `Retry ${action.retryCount}/5`}
                      </Text>
                    </View>
                    
                    {action.error && (
                      <Text style={styles.queueItemError}>{action.error}</Text>
                    )}
                    
                    <Text style={styles.queueItemTime}>
                      {new Date(action.timestamp).toLocaleString()}
                    </Text>

                    {action.retryCount < 5 && (
                      <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => handleRetry(action.id)}
                      >
                        <Text style={styles.retryButtonText}>Retry Now</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statusCard: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 12,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
  },
  queueList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  queueItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  queueItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  queueItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  queueItemStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  queueItemError: {
    fontSize: 12,
    color: colors.danger,
    marginBottom: 8,
  },
  queueItemTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});
