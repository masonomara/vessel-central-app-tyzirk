
import { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { colors, indexScreenStyles } from '../styles/commonStyles';
import { IconSymbol } from '../components/IconSymbol';
import { ListItemCard } from '../components/ListItemCard';
import { searchManager, SearchResult } from '../utils/search';
import { useData } from '../contexts/DataContext';
import { router } from 'expo-router';

interface GlobalSearchProps {
  visible: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ visible, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  const {
    maintenanceTasks,
    issues,
    supplyRequests,
    documents,
    vessels,
  } = useData();

  const searchHistory = useMemo(() => searchManager.getSearchHistory(), [visible]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return searchManager.search(query, {
      maintenanceTasks,
      issues,
      supplyRequests,
      documents,
      vessels,
    });
  }, [query, maintenanceTasks, issues, supplyRequests, documents, vessels]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    setShowHistory(false);
    if (searchQuery.trim()) {
      searchManager.addToHistory(searchQuery);
    }
  }, []);

  const handleResultPress = useCallback((result: SearchResult) => {
    onClose();
    
    switch (result.type) {
      case 'maintenance':
        router.push({
          pathname: '/detail-maintenance',
          params: { id: result.id },
        });
        break;
      case 'issue':
        router.push({ pathname: '/detail-issue', params: { id: result.id } });
        break;
      case 'supply':
        router.push({ pathname: '/detail-supply', params: { id: result.id } });
        break;
      case 'document':
        router.push({ pathname: '/detail-document', params: { id: result.id } });
        break;
      case 'vessel':
        router.push({ pathname: '/detail-vessel', params: { id: result.id } });
        break;
      default:
        console.log('Unknown result type');
    }
  }, [onClose]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return { iosName: 'wrench.and.screwdriver.fill', androidName: 'build' };
      case 'issue':
        return { iosName: 'exclamationmark.triangle.fill', androidName: 'warning' };
      case 'supply':
        return { iosName: 'shippingbox.fill', androidName: 'inventory_2' };
      case 'document':
        return { iosName: 'doc.text.fill', androidName: 'description' };
      case 'vessel':
        return { iosName: 'sailboat.fill', androidName: 'sailing' };
      default:
        return { iosName: 'circle.fill', androidName: 'circle' };
    }
  };

  const getResultBadge = (type: string) => {
    switch (type) {
      case 'maintenance':
        return { label: 'Maintenance', fg: colors.orangeForeground, bg: colors.orangeBackground };
      case 'issue':
        return { label: 'Issue', fg: colors.redForeground, bg: colors.redBackground };
      case 'supply':
        return { label: 'Supply', fg: colors.blueForeground, bg: colors.blueBackground };
      case 'document':
        return { label: 'Document', fg: colors.greenForeground, bg: colors.greenBackground };
      case 'vessel':
        return { label: 'Vessel', fg: colors.blueForeground, bg: colors.blueBackground };
      default:
        return { label: type, fg: colors.textSecondary, bg: colors.surfaceTwo };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <IconSymbol 
              ios_icon_name="chevron.left" 
              android_material_icon_name="chevron-left" 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
          <View style={[indexScreenStyles.searchContainer, { flex: 1, marginHorizontal: 0 }]}>
            <IconSymbol
              ios_icon_name="magnifyingglass"
              android_material_icon_name="search"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              style={indexScreenStyles.searchInput}
              placeholder="Global search"
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={handleSearch}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {query.trim() === '' && showHistory && searchHistory.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={() => searchManager.clearSearchHistory()}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              {searchHistory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyItem}
                  onPress={() => handleSearch(item)}
                >
                  <IconSymbol 
                    ios_icon_name="clock" 
                    android_material_icon_name="history" 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                  <Text style={styles.historyText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {query.trim() !== '' && results.length === 0 && (
            <View style={styles.emptyState}>
              <IconSymbol 
                ios_icon_name="magnifyingglass" 
                android_material_icon_name="search" 
                size={48} 
                color={colors.textSecondary} 
              />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>Try searching with different keywords</Text>
            </View>
          )}

          {results.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{results.length} Results</Text>
              {results.map((result, index) => (
                <ListItemCard
                  key={result.id}
                  title={result.title}
                  description={result.subtitle}
                  vesselName={result.data?.vesselName ?? result.data?.location ?? ''}
                  onPress={() => handleResultPress(result)}
                  icon={getResultIcon(result.type)}
                  badge={getResultBadge(result.type)}
                  isFirst={index === 0}
                  isLast={index === results.length - 1}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceOne,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,

    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  historyText: {
    fontSize: 16,
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
