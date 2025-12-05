
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { cacheManager, CACHE_KEYS } from '@/utils/cacheManager';
import { offlineManager } from '@/utils/offlineManager';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface CacheStatusProps {
  onRefresh?: () => void;
}

export function CacheStatus({ onRefresh }: CacheStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    loadCacheStatus();
    
    // Update status every 30 seconds
    const interval = setInterval(loadCacheStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadCacheStatus = async () => {
    try {
      const online = await offlineManager.getNetworkStatus();
      const pending = await offlineManager.getQueueSize();
      const size = await cacheManager.getCacheSize();
      
      // Get last sync time from cache metadata
      const metadata = await cacheManager.getMetadata(CACHE_KEYS.VESSELS);
      if (metadata) {
        setLastSync(new Date(metadata.lastUpdated));
      }
      
      setIsOnline(online);
      setPendingActions(pending);
      setCacheSize(size);
    } catch (error) {
      console.error('Error loading cache status:', error);
    }
  };

  const handleSync = async () => {
    try {
      await offlineManager.syncOfflineQueue();
      await loadCacheStatus();
      onRefresh?.();
    } catch (error) {
      console.error('Error syncing:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (date: Date | null): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.warning }]} />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        
        {pendingActions > 0 && (
          <View style={styles.statusItem}>
            <IconSymbol 
              ios_icon_name="clock.fill" 
              android_material_icon_name="schedule" 
              size={14} 
              color={colors.warning} 
            />
            <Text style={styles.statusText}>
              {pendingActions} pending
            </Text>
          </View>
        )}
        
        <View style={styles.statusItem}>
          <IconSymbol 
            ios_icon_name="internaldrive.fill" 
            android_material_icon_name="storage" 
            size={14} 
            color={colors.textSecondary} 
          />
          <Text style={styles.statusText}>
            {formatBytes(cacheSize)}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <IconSymbol 
            ios_icon_name="clock" 
            android_material_icon_name="access_time" 
            size={14} 
            color={colors.textSecondary} 
          />
          <Text style={styles.statusText}>
            {formatTime(lastSync)}
          </Text>
        </View>
      </View>
      
      {pendingActions > 0 && isOnline && (
        <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
          <IconSymbol 
            ios_icon_name="arrow.clockwise" 
            android_material_icon_name="sync" 
            size={16} 
            color={colors.accent} 
          />
          <Text style={styles.syncButtonText}>Sync Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.accent + '20',
    borderRadius: 8,
  },
  syncButtonText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
});
