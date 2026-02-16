
# Cache Migration Guide

## Overview

This guide helps you migrate existing code to use the new caching system.

## Before Migration

### Old Pattern (Direct AsyncStorage)

```typescript
// Loading data
const loadData = async () => {
  const data = await AsyncStorage.getItem('@my_data');
  if (data) {
    setMyData(JSON.parse(data));
  }
};

// Saving data
const saveData = async () => {
  await AsyncStorage.setItem('@my_data', JSON.stringify(myData));
};
```

### Issues with Old Pattern

- No expiration handling
- No cache invalidation
- No offline support
- No versioning
- Manual JSON parsing
- No metadata tracking

## After Migration

### New Pattern (Cache Manager)

```typescript
import { cacheManager, CACHE_KEYS, CACHE_EXPIRATION } from '@/utils/cacheManager';

// Loading data
const loadData = async () => {
  const data = await cacheManager.get(CACHE_KEYS.MY_DATA);
  if (data) {
    setMyData(data);
  } else {
    // Fetch fresh data
    const freshData = await fetchMyData();
    await cacheManager.set(CACHE_KEYS.MY_DATA, freshData, CACHE_EXPIRATION.MEDIUM);
    setMyData(freshData);
  }
};

// Saving data (automatic)
// Cache is automatically saved when data changes
```

### Benefits of New Pattern

- ✅ Automatic expiration
- ✅ Cache invalidation
- ✅ Offline support
- ✅ Versioning
- ✅ Automatic JSON handling
- ✅ Metadata tracking

## Migration Steps

### Step 1: Add Cache Key

Add your cache key to `CACHE_KEYS` in `utils/cacheManager.ts`:

```typescript
export const CACHE_KEYS = {
  // ... existing keys
  MY_DATA: '@cache_my_data',
};
```

### Step 2: Replace AsyncStorage Calls

#### Before:
```typescript
const data = await AsyncStorage.getItem('@my_data');
const parsed = data ? JSON.parse(data) : null;
```

#### After:
```typescript
const data = await cacheManager.get(CACHE_KEYS.MY_DATA);
```

### Step 3: Add Expiration

#### Before:
```typescript
await AsyncStorage.setItem('@my_data', JSON.stringify(data));
```

#### After:
```typescript
await cacheManager.set(CACHE_KEYS.MY_DATA, data, CACHE_EXPIRATION.MEDIUM);
```

### Step 4: Use Cache Hook (Optional)

For components, use the `useCache` hook:

#### Before:
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    const cached = await AsyncStorage.getItem('@my_data');
    if (cached) {
      setData(JSON.parse(cached));
    } else {
      const fresh = await fetchData();
      await AsyncStorage.setItem('@my_data', JSON.stringify(fresh));
      setData(fresh);
    }
    setLoading(false);
  };
  loadData();
}, []);
```

#### After:
```typescript
const { data, isLoading } = useCache({
  key: CACHE_KEYS.MY_DATA,
  fetchData: fetchData,
  expiration: CACHE_EXPIRATION.MEDIUM,
});
```

### Step 5: Add Cache Invalidation

Add cache invalidation when data changes:

```typescript
const updateData = async (newData) => {
  setData(newData);
  await cacheHelpers.invalidateCache('MY_DATA');
};
```

### Step 6: Add Offline Support (Optional)

Add offline queue for mutations:

```typescript
const createItem = async (item) => {
  setItems([...items, item]);
  await cacheHelpers.invalidateCache('ITEMS');
  
  if (!(await offlineManager.getNetworkStatus())) {
    await offlineManager.addToOfflineQueue({
      type: 'create',
      entity: 'item',
      data: item,
    });
  }
};
```

## Common Migration Scenarios

### Scenario 1: Simple Data Storage

#### Before:
```typescript
// Save
await AsyncStorage.setItem('@user_prefs', JSON.stringify(prefs));

// Load
const data = await AsyncStorage.getItem('@user_prefs');
const prefs = data ? JSON.parse(data) : defaultPrefs;
```

#### After:
```typescript
// Save
await cacheManager.set(CACHE_KEYS.USER_PREFERENCES, prefs, CACHE_EXPIRATION.NEVER);

// Load
const prefs = await cacheManager.get(CACHE_KEYS.USER_PREFERENCES) || defaultPrefs;
```

### Scenario 2: List Data with Refresh

#### Before:
```typescript
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

const loadItems = async () => {
  setLoading(true);
  const cached = await AsyncStorage.getItem('@items');
  if (cached) {
    setItems(JSON.parse(cached));
  }
  
  const fresh = await fetchItems();
  setItems(fresh);
  await AsyncStorage.setItem('@items', JSON.stringify(fresh));
  setLoading(false);
};

useEffect(() => {
  loadItems();
}, []);
```

#### After:
```typescript
const { data: items, isLoading, refetch } = useCache({
  key: CACHE_KEYS.ITEMS,
  fetchData: fetchItems,
  expiration: CACHE_EXPIRATION.MEDIUM,
  staleWhileRevalidate: true,
});
```

### Scenario 3: Data with Mutations

#### Before:
```typescript
const addItem = async (item) => {
  const newItems = [...items, item];
  setItems(newItems);
  await AsyncStorage.setItem('@items', JSON.stringify(newItems));
  await api.createItem(item);
};
```

#### After:
```typescript
const addItem = async (item) => {
  setItems([...items, item]);
  await cacheHelpers.invalidateCache('ITEMS');
  
  if (!(await offlineManager.getNetworkStatus())) {
    await offlineManager.addToOfflineQueue({
      type: 'create',
      entity: 'item',
      data: item,
    });
  } else {
    await api.createItem(item);
  }
};
```

### Scenario 4: Multiple Data Sources

#### Before:
```typescript
const loadAllData = async () => {
  const [users, posts, comments] = await Promise.all([
    AsyncStorage.getItem('@users'),
    AsyncStorage.getItem('@posts'),
    AsyncStorage.getItem('@comments'),
  ]);
  
  setUsers(users ? JSON.parse(users) : []);
  setPosts(posts ? JSON.parse(posts) : []);
  setComments(comments ? JSON.parse(comments) : []);
};
```

#### After:
```typescript
const { data } = useMultiCache([
  { key: CACHE_KEYS.USERS, fetchData: fetchUsers },
  { key: CACHE_KEYS.POSTS, fetchData: fetchPosts },
  { key: CACHE_KEYS.COMMENTS, fetchData: fetchComments },
]);

const { users, posts, comments } = data;
```

## DataContext Migration

### Before:
```typescript
const loadData = useCallback(async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsed = JSON.parse(data);
    setVessels(parsed.vessels);
    setIssues(parsed.issues);
  }
}, []);

const saveData = useCallback(async () => {
  const data = { vessels, issues };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}, [vessels, issues]);
```

### After:
```typescript
const loadData = useCallback(async () => {
  const vessels = await cacheManager.get(CACHE_KEYS.VESSELS);
  const issues = await cacheManager.get(CACHE_KEYS.ISSUES);
  
  if (vessels) setVessels(vessels);
  if (issues) setIssues(issues);
}, []);

const saveData = useCallback(async () => {
  await cacheManager.setMultiple([
    { key: CACHE_KEYS.VESSELS, data: vessels, expiration: CACHE_EXPIRATION.LONG },
    { key: CACHE_KEYS.ISSUES, data: issues, expiration: CACHE_EXPIRATION.MEDIUM },
  ]);
}, [vessels, issues]);
```

## Testing Migration

### 1. Test Cache Loading

```typescript
// Clear cache
await cacheManager.clearAll();

// Load data
const data = await cacheManager.get(CACHE_KEYS.MY_DATA);
console.log('Should be null:', data);

// Set cache
await cacheManager.set(CACHE_KEYS.MY_DATA, testData, CACHE_EXPIRATION.MEDIUM);

// Load again
const cached = await cacheManager.get(CACHE_KEYS.MY_DATA);
console.log('Should have data:', cached);
```

### 2. Test Expiration

```typescript
// Set with short expiration
await cacheManager.set(CACHE_KEYS.MY_DATA, testData, 1000); // 1 second

// Wait
await new Promise(resolve => setTimeout(resolve, 2000));

// Should be expired
const expired = await cacheManager.get(CACHE_KEYS.MY_DATA);
console.log('Should be null:', expired);
```

### 3. Test Offline Queue

```typescript
// Add to queue
await offlineManager.addToOfflineQueue({
  type: 'create',
  entity: 'test',
  data: { id: 1 },
});

// Check queue
const size = await offlineManager.getQueueSize();
console.log('Should be 1:', size);

// Sync
await offlineManager.syncOfflineQueue();

// Check again
const newSize = await offlineManager.getQueueSize();
console.log('Should be 0:', newSize);
```

## Rollback Plan

If you need to rollback:

1. **Keep Legacy Storage**: The system maintains backward compatibility
2. **Gradual Migration**: Migrate one feature at a time
3. **Feature Flags**: Use flags to enable/disable caching

```typescript
const USE_NEW_CACHE = true;

const loadData = async () => {
  if (USE_NEW_CACHE) {
    return await cacheManager.get(CACHE_KEYS.MY_DATA);
  } else {
    const data = await AsyncStorage.getItem('@my_data');
    return data ? JSON.parse(data) : null;
  }
};
```

## Checklist

- [ ] Add cache keys to `CACHE_KEYS`
- [ ] Replace AsyncStorage calls with cacheManager
- [ ] Add appropriate expiration times
- [ ] Add cache invalidation on mutations
- [ ] Add offline support for mutations
- [ ] Use `useCache` hook in components
- [ ] Add `CacheStatus` component
- [ ] Test cache loading
- [ ] Test cache expiration
- [ ] Test offline queue
- [ ] Update documentation
- [ ] Train team on new patterns

## Support

If you encounter issues:

1. Check the [Full Documentation](./CACHING_SYSTEM.md)
2. Review [Quick Reference](./CACHE_QUICK_REFERENCE.md)
3. Check cache settings screen for debugging
4. Clear cache and try again
5. Check console logs for errors

## Next Steps

After migration:

1. Monitor cache performance
2. Adjust expiration times based on usage
3. Add cache warming for critical data
4. Implement cache compression if needed
5. Add cache analytics
6. Optimize cache size

## Conclusion

The new caching system provides:
- Better performance
- Offline support
- Automatic management
- Better developer experience

Take your time with migration and test thoroughly!
