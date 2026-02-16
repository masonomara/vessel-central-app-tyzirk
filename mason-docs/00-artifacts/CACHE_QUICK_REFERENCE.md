
# Cache System Quick Reference

## Quick Start

### 1. Use Cache in Components

```typescript
import { useCache } from '@/hooks/useCache';
import { CACHE_KEYS, CACHE_EXPIRATION } from '@/utils/cacheManager';

const { data, isLoading, refetch } = useCache({
  key: CACHE_KEYS.VESSELS,
  fetchData: async () => await fetchVessels(),
  expiration: CACHE_EXPIRATION.LONG,
});
```

### 2. Show Cache Status

```typescript
import { CacheStatus } from '@/components/CacheStatus';

<CacheStatus onRefresh={handleRefresh} />
```

### 3. Invalidate Cache on Mutations

```typescript
import { cacheHelpers } from '@/utils/cacheManager';

const addItem = async (item) => {
  // Update state
  setItems([...items, item]);
  
  // Invalidate cache
  await cacheHelpers.invalidateCache('MAINTENANCE_TASKS');
};
```

## Common Operations

### Cache Operations

```typescript
import { cacheManager, CACHE_KEYS, CACHE_EXPIRATION } from '@/utils/cacheManager';

// Set cache
await cacheManager.set(CACHE_KEYS.VESSELS, data, CACHE_EXPIRATION.LONG);

// Get cache
const data = await cacheManager.get(CACHE_KEYS.VESSELS);

// Get stale cache (for offline)
const staleData = await cacheManager.getStale(CACHE_KEYS.VESSELS);

// Check if valid
const isValid = await cacheManager.isValid(CACHE_KEYS.VESSELS);

// Remove cache
await cacheManager.remove(CACHE_KEYS.VESSELS);

// Clear all
await cacheManager.clearAll();

// Clear expired
await cacheManager.clearExpired();

// Get cache size
const size = await cacheManager.getCacheSize();
```

### Offline Operations

```typescript
import { offlineManager } from '@/utils/offlineManager';

// Check if online
const isOnline = offlineManager.isDeviceOnline();

// Add to offline queue
await offlineManager.addToOfflineQueue({
  type: 'create',
  entity: 'maintenance',
  data: newTask,
});

// Sync offline queue
await offlineManager.syncOfflineQueue();

// Get queue size
const size = await offlineManager.getQueueSize();

// Check if has pending actions
const hasPending = await offlineManager.hasPendingActions();
```

### Helper Functions

```typescript
import { cacheHelpers } from '@/utils/cacheManager';

// Cache data
await cacheHelpers.cacheData('VESSELS', vesselsData);

// Get cached data
const vessels = await cacheHelpers.getCachedData('VESSELS');

// Invalidate cache
await cacheHelpers.invalidateCache('VESSELS');

// Refresh cache
await cacheHelpers.refreshCache('VESSELS', newData);
```

## Cache Keys

```typescript
CACHE_KEYS = {
  VESSELS: '@cache_vessels',
  MAINTENANCE_TASKS: '@cache_maintenance_tasks',
  ISSUES: '@cache_issues',
  SUPPLY_REQUESTS: '@cache_supply_requests',
  DOCUMENTS: '@cache_documents',
  ACTIVITY_LOGS: '@cache_activity_logs',
  NOTIFICATIONS: '@cache_notifications',
  EXPENSES: '@cache_expenses',
}
```

## Expiration Times

```typescript
CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  NEVER: Infinity,
}
```

## Recommended Expiration by Data Type

| Data Type | Expiration | Reason |
|-----------|------------|--------|
| Vessels | LONG (24h) | Rarely changes |
| Documents | LONG (24h) | Rarely changes |
| Maintenance Tasks | MEDIUM (30m) | Moderate changes |
| Issues | MEDIUM (30m) | Moderate changes |
| Supply Requests | MEDIUM (30m) | Moderate changes |
| Expenses | MEDIUM (30m) | Moderate changes |
| Activity Logs | SHORT (5m) | Frequent changes |
| Notifications | SHORT (5m) | Frequent changes |

## Navigation

### Cache Settings Screen

```typescript
import { router } from 'expo-router';

router.push('/cache-settings');
```

## Components

### CacheStatus

```typescript
<CacheStatus onRefresh={() => console.log('Refreshed')} />
```

Shows:
- Network status (online/offline)
- Pending actions count
- Cache size
- Last sync time
- Sync button (when pending actions)

## Patterns

### Stale-While-Revalidate

```typescript
const { data, isLoading, isStale } = useCache({
  key: CACHE_KEYS.VESSELS,
  fetchData: fetchVessels,
  staleWhileRevalidate: true, // Enable pattern
});

// Show stale indicator
{isStale && <Text>Refreshing...</Text>}
```

### Optimistic Updates

```typescript
const addItem = async (item) => {
  // 1. Update UI immediately
  setItems([...items, item]);
  
  // 2. Invalidate cache
  await cacheHelpers.invalidateCache('ITEMS');
  
  // 3. Queue if offline
  if (!(await offlineManager.getNetworkStatus())) {
    await offlineManager.addToOfflineQueue({
      type: 'create',
      entity: 'item',
      data: item,
    });
  }
  
  // 4. Try to sync
  try {
    await api.createItem(item);
  } catch (error) {
    // Rollback on error
    setItems(items);
  }
};
```

### Batch Operations

```typescript
// Set multiple
await cacheManager.setMultiple([
  { key: CACHE_KEYS.VESSELS, data: vessels },
  { key: CACHE_KEYS.ISSUES, data: issues },
]);

// Get multiple
const results = await cacheManager.getMultiple([
  CACHE_KEYS.VESSELS,
  CACHE_KEYS.ISSUES,
]);
```

## Debugging

### Check Cache Info

```typescript
const info = await cacheManager.getAllCacheInfo();
console.log('Cache info:', info);
```

### Check Metadata

```typescript
const metadata = await cacheManager.getMetadata(CACHE_KEYS.VESSELS);
console.log('Last updated:', new Date(metadata.lastUpdated));
console.log('Expires at:', new Date(metadata.expiresAt));
```

### Check Offline Queue

```typescript
const queue = await offlineManager.getOfflineQueue();
console.log('Pending actions:', queue);
```

## Best Practices

1. **Always invalidate cache on mutations**
   ```typescript
   await cacheHelpers.invalidateCache('ITEMS');
   ```

2. **Use appropriate expiration times**
   ```typescript
   // Frequently changing data
   expiration: CACHE_EXPIRATION.SHORT
   
   // Rarely changing data
   expiration: CACHE_EXPIRATION.LONG
   ```

3. **Handle offline scenarios**
   ```typescript
   if (!(await offlineManager.getNetworkStatus())) {
     await offlineManager.addToOfflineQueue({...});
   }
   ```

4. **Show cache status to users**
   ```typescript
   <CacheStatus onRefresh={handleRefresh} />
   ```

5. **Provide cache management**
   ```typescript
   <Button onPress={() => router.push('/cache-settings')}>
     Cache Settings
   </Button>
   ```

## Troubleshooting

### Cache not loading?
```typescript
// Check if valid
const isValid = await cacheManager.isValid(key);

// Try stale data
const staleData = await cacheManager.getStale(key);

// Check metadata
const metadata = await cacheManager.getMetadata(key);
```

### Offline queue not syncing?
```typescript
// Check network
const isOnline = offlineManager.isDeviceOnline();

// Check queue
const size = await offlineManager.getQueueSize();

// Manual sync
await offlineManager.syncOfflineQueue();
```

### Cache too large?
```typescript
// Check size
const size = await cacheManager.getCacheSize();

// Clear expired
await cacheManager.clearExpired();

// Clear all
await cacheManager.clearAll();
```

## Links

- Full Documentation: `docs/CACHING_SYSTEM.md`
- Implementation Summary: `docs/CACHE_IMPLEMENTATION_SUMMARY.md`
- Cache Manager: `utils/cacheManager.ts`
- Offline Manager: `utils/offlineManager.ts`
- useCache Hook: `hooks/useCache.ts`
- Cache Status Component: `components/CacheStatus.tsx`
- Cache Settings Screen: `app/cache-settings.tsx`
