
import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from '../components/IconSymbol';
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
          pathname: '/maintenance-detail',
          params: { id: result.id },
        });
        break;
      case 'issue':
        router.push({ pathname: '/issue-detail', params: { id: result.id } });
        break;
      case 'supply':
        router.push({ pathname: '/supply-detail', params: { id: result.id } });
        break;
      case 'document':
        router.push({ pathname: '/document-detail', params: { id: result.id } });
        break;
      case 'vessel':
        router.push({ pathname: '/vessel-detail', params: { id: result.id } });
        break;
      default:
        console.log('Unknown result type');
    }
  }, [onClose]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return { ios: 'wrench.and.screwdriver.fill', android: 'build' };
      case 'issue':
        return { ios: 'exclamationmark.triangle.fill', android: 'warning' };
      case 'supply':
        return { ios: 'shippingbox.fill', android: 'inventory_2' };
      case 'document':
        return { ios: 'doc.text.fill', android: 'description' };
      case 'vessel':
        return { ios: 'sailboat.fill', android: 'sailing' };
      default:
        return { ios: 'circle.fill', android: 'circle' };
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return colors.warning;
      case 'issue':
        return colors.danger;
      case 'supply':
        return colors.accent;
      case 'document':
        return colors.success;
      case 'vessel':
        return colors.accent;
      default:
        return colors.textSecondary;
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
              android_material_icon_name="arrow-back" 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <IconSymbol 
              ios_icon_name="magnifyingglass" 
              android_material_icon_name="search" 
              size={20} 
              color={colors.textSecondary} 
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search everything..."
              placeholderTextColor={colors.textSecondary}
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
              {results.map((result, index) => {
                const icon = getResultIcon(result.type);
                const color = getResultColor(result.type);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => handleResultPress(result)}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: color + '20' }]}>
                      <IconSymbol 
                        ios_icon_name={icon.ios} 
                        android_material_icon_name={icon.android} 
                        size={24} 
                        color={color} 
                      />
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={styles.resultTitle}>{result.title}</Text>
                      <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                    </View>
                    <View style={styles.resultBadge}>
                      <Text style={styles.resultBadgeText}>{result.type.toUpperCase()}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
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
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.accent,
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
