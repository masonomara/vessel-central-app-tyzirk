
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { cacheManager, CACHE_KEYS } from '@/utils/cacheManager';
import { offlineManager } from '@/utils/offlineManager';
import { IconSymbol } from '@/components/IconSymbol';

export default function CacheSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [cacheInfo, setCacheInfo] = useState<Record<string, any>>({});
  const [totalSize, setTotalSize] = useState(0);
  const [pendingActions, setPendingActions] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const loadCacheInfo = async () => {
    try {
      const info = await cacheManager.getAllCacheInfo();
      const size = await cacheManager.getCacheSize();
      const pending = await offlineManager.getQueueSize();
      const online = await offlineManager.getNetworkStatus();
      
      setCacheInfo(info);
      setTotalSize(size);
      setPendingActions(pending);
      setIsOnline(online);
    } catch (error) {
      console.error('Error loading cache info:', error);
    }
  };

  const handleClearCache = async (key?: string) => {
    Alert.alert(
      'Clear Cache',
      key ? `Clear cache for ${key}?` : 'Clear all cache data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              if (key) {
                await cacheManager.remove(key);
              } else {
                await cacheManager.clearAll();
              }
              await loadCacheInfo();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleClearExpired = async () => {
    try {
      await cacheManager.clearExpired();
      await loadCacheInfo();
      Alert.alert('Success', 'Expired cache cleared successfully');
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      Alert.alert('Error', 'Failed to clear expired cache');
    }
  };

  const handleSyncOfflineQueue = async () => {
    try {
      await offlineManager.syncOfflineQueue();
      await loadCacheInfo();
      Alert.alert('Success', 'Offline queue synced successfully');
    } catch (error) {
      console.error('Error syncing offline queue:', error);
      Alert.alert('Error', 'Failed to sync offline queue');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getCacheName = (key: string): string => {
    const names: Record<string, string> = {
      [CACHE_KEYS.VESSELS]: 'Vessels',
      [CACHE_KEYS.MAINTENANCE_TASKS]: 'Maintenance Tasks',
      [CACHE_KEYS.ISSUES]: 'Issues',
      [CACHE_KEYS.SUPPLY_REQUESTS]: 'Supply Requests',
      [CACHE_KEYS.DOCUMENTS]: 'Documents',
      [CACHE_KEYS.ACTIVITY_LOGS]: 'Activity Logs',
      [CACHE_KEYS.NOTIFICATIONS]: 'Notifications',
      [CACHE_KEYS.EXPENSES]: 'Expenses',
    };
    return names[key] || key;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="arrow_back" 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <Text style={styles.title}>Cache Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.warning }]} />
              <Text style={styles.statusLabel}>Network</Text>
              <Text style={styles.statusValue}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
            <View style={styles.statusItem}>
              <IconSymbol 
                ios_icon_name="internaldrive.fill" 
                android_material_icon_name="storage" 
                size={20} 
                color={colors.accent} 
              />
              <Text style={styles.statusLabel}>Total Size</Text>
              <Text style={styles.statusValue}>{formatBytes(totalSize)}</Text>
            </View>
            <View style={styles.statusItem}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule" 
                size={20} 
                color={colors.warning} 
              />
              <Text style={styles.statusLabel}>Pending</Text>
              <Text style={styles.statusValue}>{pendingActions}</Text>
            </View>
          </View>
        </View>

        {/* Actions Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleClearExpired}>
            <IconSymbol 
              ios_icon_name="trash" 
              android_material_icon_name="delete_sweep" 
              size={20} 
              color={colors.accent} 
            />
            <Text style={styles.actionButtonText}>Clear Expired Cache</Text>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          {pendingActions > 0 && isOnline && (
            <TouchableOpacity style={styles.actionButton} onPress={handleSyncOfflineQueue}>
              <IconSymbol 
                ios_icon_name="arrow.clockwise" 
                android_material_icon_name="sync" 
                size={20} 
                color={colors.success} 
              />
              <Text style={styles.actionButtonText}>Sync Offline Queue</Text>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={() => handleClearCache()}
          >
            <IconSymbol 
              ios_icon_name="trash.fill" 
              android_material_icon_name="delete_forever" 
              size={20} 
              color={colors.danger} 
            />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Cache</Text>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Cache Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cache Details</Text>
          
          {Object.entries(cacheInfo).map(([key, metadata], index) => (
            <View key={`cache-${index}`} style={styles.cacheItem}>
              <View style={styles.cacheItemHeader}>
                <Text style={styles.cacheItemName}>{getCacheName(key)}</Text>
                {metadata && (
                  <TouchableOpacity onPress={() => handleClearCache(key)}>
                    <IconSymbol 
                      ios_icon_name="trash" 
                      android_material_icon_name="delete" 
                      size={18} 
                      color={colors.danger} 
                    />
                  </TouchableOpacity>
                )}
              </View>
              
              {metadata ? (
                <View style={styles.cacheItemDetails}>
                  <Text style={styles.cacheItemDetail}>
                    Last Updated: {formatDate(metadata.lastUpdated)}
                  </Text>
                  <Text style={styles.cacheItemDetail}>
                    Expires: {formatDate(metadata.expiresAt)}
                  </Text>
                  <Text style={styles.cacheItemDetail}>
                    Version: {metadata.version}
                  </Text>
                  <View style={[
                    styles.cacheItemStatus,
                    { backgroundColor: Date.now() > metadata.expiresAt ? colors.danger + '20' : colors.success + '20' }
                  ]}>
                    <Text style={[
                      styles.cacheItemStatusText,
                      { color: Date.now() > metadata.expiresAt ? colors.danger : colors.success }
                    ]}>
                      {Date.now() > metadata.expiresAt ? 'Expired' : 'Valid'}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.cacheItemEmpty}>No cache data</Text>
              )}
            </View>
          ))}
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statusRow: {
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: colors.danger + '30',
  },
  dangerText: {
    color: colors.danger,
  },
  cacheItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cacheItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cacheItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cacheItemDetails: {
    gap: 4,
  },
  cacheItemDetail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cacheItemStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  cacheItemStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cacheItemEmpty: {
    fontSize: 13,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
});
