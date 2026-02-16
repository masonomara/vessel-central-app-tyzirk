
# Caching System Documentation

## Overview

The Vessel & Co. app now implements a comprehensive caching system using AsyncStorage for instant data access, offline support, and improved performance.

## Architecture

### Core Components

1. **Cache Manager** (`utils/cacheManager.ts`)
   - Centralized cache management
   - Automatic expiration handling
   - Cache versioning for invalidation
   - Batch operations support

2. **Offline Manager** (`utils/offlineManager.ts`)
   - Network status monitoring (using expo-network)
   - Offline action queue
   - Automatic sync when back online
   - Retry logic with max attempts (3 retries)

3. **useCache Hook** (`hooks/useCache.ts`)
   - React hook for easy cache integration
   - Stale-while-revalidate pattern
   - Automatic background refresh
   - Loading and error states

4. **Cache Status Component** (`components/CacheStatus.tsx`)
   - Visual cache status indicator
   - Pending actions counter
   - Manual sync trigger
   - Cache size display

## Cache Keys

All cache keys are defined in `CACHE_KEYS`:

- `VESSELS` - Vessel data (24h expiration)
- `MAINTENANCE_TASKS` - Maintenance tasks (30min expiration)
- `ISSUES` - Issue reports (30min expiration)
- `SUPPLY_REQUESTS` - Supply requests (30min expiration)
- `DOCUMENTS` - Documents (24h expiration)
- `ACTIVITY_LOGS` - Activity logs (5min expiration)
- `NOTIFICATIONS` - Notifications (5min expiration)
- `EXPENSES` - Expense records (30min expiration)

## Cache Expiration Times

```typescript
CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  NEVER: Infinity,
}
```

## Usage Examples

### Basic Cache Operations

```typescript
import { cacheManager, CACHE_KEYS, CACHE_EXPIRATION } from '@/utils/cacheManager';

// Set cache
await cacheManager.set(CACHE_KEYS.VESSELS, vesselsData, CACHE_EXPIRATION.LONG);

// Get cache
const vessels = await cacheManager.get<Vessel[]>(CACHE_KEYS.VESSELS);

// Remove cache
await cacheManager.remove(CACHE_KEYS.VESSELS);

// Clear all cache
await cacheManager.clearAll();

// Clear expired cache
await cacheManager.clearExpired();
```

### Using the useCache Hook

```typescript
import { useCache } from '@/hooks/useCache';
import { CACHE_KEYS, CACHE_EXPIRATION } from '@/utils/cacheManager';

function MyComponent() {
  const { data, isLoading, isError, refetch, isStale } = useCache({
    key: CACHE_KEYS.VESSELS,
    fetchData: async () => {
      // Fetch fresh data from API
      return await fetchVessels();
    },
    expiration: CACHE_EXPIRATION.LONG,
    staleWhileRevalidate: true,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;
  
  return (
    <View>
      {isStale && <Text>Refreshing...</Text>}
      {data && <VesselList vessels={data} />}
      <Button onPress={refetch}>Refresh</Button>
    </View>
  );
}
```

### Helper Functions

```typescript
import { cacheHelpers } from '@/utils/cacheManager';

// Cache data
await cacheHelpers.cacheData('VESSELS', vesselsData);

// Get cached data
const vessels = await cacheHelpers.getCachedData<Vessel[]>('VESSELS');

// Invalidate cache
await cacheHelpers.invalidateCache('VESSELS');

// Refresh cache
await cacheHelpers.refreshCache('VESSELS', newVesselsData);
```

### Offline Support

```typescript
import { offlineManager } from '@/utils/offlineManager';

// Check network status
const isOnline = offlineManager.isDeviceOnline();

// Add action to offline queue
await offlineManager.addToOfflineQueue({
  type: 'create',
  entity: 'maintenance',
  data: newTask,
});

// Manually sync offline queue
await offlineManager.syncOfflineQueue();

// Get pending actions count
const pendingCount = await offlineManager.getQueueSize();
```

## Cache Invalidation Strategy

### Automatic Invalidation

Cache is automatically invalidated when:
- Data is created, updated, or deleted
- Cache version changes (app update)
- Cache expires based on expiration time

### Manual Invalidation

Users can manually clear cache through:
- Cache Settings screen (`/cache-settings`)
- Individual cache entries
- All cache at once
- Expired cache only

## Stale-While-Revalidate Pattern

The app implements the stale-while-revalidate pattern:

1. **First Load**: Fetch from cache if available, show immediately
2. **Background Refresh**: Fetch fresh data in background
3. **Update**: Replace cached data with fresh data when available
4. **Offline**: Show stale data even if expired

This provides:
- Instant data access
- Always fresh data
- Offline support
- Better user experience

## Performance Optimizations

### Batch Operations

```typescript
// Set multiple cache entries at once
await cacheManager.setMultiple([
  { key: CACHE_KEYS.VESSELS, data: vessels, expiration: CACHE_EXPIRATION.LONG },
  { key: CACHE_KEYS.ISSUES, data: issues, expiration: CACHE_EXPIRATION.MEDIUM },
]);

// Get multiple cache entries at once
const results = await cacheManager.getMultiple([
  CACHE_KEYS.VESSELS,
  CACHE_KEYS.ISSUES,
]);
```

### Debounced Saves

The DataContext automatically debounces cache saves to prevent excessive writes:
- Saves are delayed by 1 second
- Multiple rapid changes result in a single save
- Reduces AsyncStorage write operations

### Cache Size Management

Monitor cache size:

```typescript
const size = await cacheManager.getCacheSize();
console.log(`Cache size: ${size} bytes`);
```

## Cache Metadata

Each cache entry includes metadata:

```typescript
interface CacheMetadata {
  version: string;      // Cache version for invalidation
  lastUpdated: number;  // Timestamp of last update
  expiresAt: number;    // Timestamp when cache expires
}
```

Access metadata:

```typescript
const metadata = await cacheManager.getMetadata(CACHE_KEYS.VESSELS);
console.log('Last updated:', new Date(metadata.lastUpdated));
console.log('Expires at:', new Date(metadata.expiresAt));
```

## Best Practices

### 1. Choose Appropriate Expiration Times

- **Frequently changing data**: SHORT (5 minutes)
  - Activity logs, notifications
- **Moderately changing data**: MEDIUM (30 minutes)
  - Maintenance tasks, issues, supply requests
- **Rarely changing data**: LONG (24 hours)
  - Vessels, documents

### 2. Invalidate Cache on Mutations

Always invalidate cache when data changes:

```typescript
const addMaintenanceTask = async (task) => {
  // Add task
  setMaintenanceTasks([...maintenanceTasks, newTask]);
  
  // Invalidate cache
  await cacheHelpers.invalidateCache('MAINTENANCE_TASKS');
};
```

### 3. Handle Offline Scenarios

Add actions to offline queue when offline:

```typescript
if (!(await offlineManager.getNetworkStatus())) {
  await offlineManager.addToOfflineQueue({
    type: 'create',
    entity: 'maintenance',
    data: newTask,
  });
}
```

### 4. Show Cache Status

Use the CacheStatus component to show users:
- Network status
- Pending offline actions
- Cache size
- Last sync time

```typescript
import { CacheStatus } from '@/components/CacheStatus';

<CacheStatus onRefresh={handleRefresh} />
```

### 5. Provide Cache Management

Give users control over cache:
- Link to Cache Settings screen
- Clear expired cache automatically
- Allow manual cache clearing

## Monitoring and Debugging

### Cache Info

Get all cache information:

```typescript
const cacheInfo = await cacheManager.getAllCacheInfo();
console.log('Cache info:', cacheInfo);
```

### Network Status

Monitor network changes:

```typescript
// Network status is automatically monitored
// Check current status:
const isOnline = await offlineManager.getNetworkStatus();
```

### Offline Queue

Check pending actions:

```typescript
const queue = await offlineManager.getOfflineQueue();
console.log('Pending actions:', queue);
```

## Migration from Legacy Storage

The system automatically migrates from legacy storage:

1. Tries to load from new cache system
2. Falls back to legacy `@vessel_co_data` key
3. Saves to both systems for compatibility
4. Future versions can remove legacy support

## Future Enhancements

Potential improvements:

1. **Compression**: Compress large cache entries
2. **Encryption**: Encrypt sensitive cached data
3. **Selective Sync**: Sync only changed data
4. **Background Sync**: Periodic background sync
5. **Cache Warming**: Pre-load cache on app start
6. **Analytics**: Track cache hit/miss rates
7. **Smart Expiration**: Adjust expiration based on usage patterns

## Troubleshooting

### Cache Not Loading

1. Check cache validity: `await cacheManager.isValid(key)`
2. Check cache metadata: `await cacheManager.getMetadata(key)`
3. Try getting stale data: `await cacheManager.getStale(key)`

### Offline Queue Not Syncing

1. Check network status: `offlineManager.isDeviceOnline()`
2. Check queue size: `await offlineManager.getQueueSize()`
3. Manually trigger sync: `await offlineManager.syncOfflineQueue()`

### Cache Size Too Large

1. Check cache size: `await cacheManager.getCacheSize()`
2. Clear expired cache: `await cacheManager.clearExpired()`
3. Clear specific entries: `await cacheManager.remove(key)`
4. Clear all cache: `await cacheManager.clearAll()`

## Conclusion

The caching system provides:
- ✅ Instant data access
- ✅ Offline support
- ✅ Automatic sync
- ✅ Cache invalidation
- ✅ Performance optimization
- ✅ User control
- ✅ Easy integration

This results in a faster, more reliable app with better user experience.
