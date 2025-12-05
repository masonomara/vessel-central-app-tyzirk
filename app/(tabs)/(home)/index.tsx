
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Animated,
  Platform
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { colors, commonStyles, shadows } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FilterType = 'All' | 'On Charter' | 'In Port' | 'Yard' | 'Issues';
type VesselStatus = 'active' | 'maintenance' | 'charter' | 'docked';

interface UserCardData {
  role: 'owner' | 'manager' | 'crew';
  name: string;
  id: string;
  vessels: string[];
  vesselIds: string[];
  icon: string;
  iconAndroid: string;
  color: string;
  statusPill: string;
  statusColor: string;
  operationalData: string;
}

const FILTER_CHIPS: FilterType[] = ['All', 'On Charter', 'In Port', 'Yard', 'Issues'];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { userRole, setUserRole, setUserName, setUserId } = useAuth();
  const { vessels, issues, maintenanceTasks } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const hasCheckedAuth = useRef(false);

  const checkAuthentication = useCallback(async () => {
    // Only check once
    if (hasCheckedAuth.current) {
      console.log('Already checked authentication, skipping...');
      return;
    }
    
    hasCheckedAuth.current = true;
    console.log('Checking authentication...');
    
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const userId = await AsyncStorage.getItem('userId');
      const userRole = await AsyncStorage.getItem('userRole');
      const userName = await AsyncStorage.getItem('userName');
      
      if (!authToken || !userId || !userRole || !userName) {
        console.log('No authentication found, redirecting to login');
        router.replace('/login');
      } else {
        console.log('User authenticated:', userName, 'Role:', userRole);
        await setUserRole(userRole as 'owner' | 'manager' | 'crew');
        await setUserName(userName);
        await setUserId(userId);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      router.replace('/login');
    } finally {
      setIsCheckingAuth(false);
    }
  }, [router, setUserRole, setUserName, setUserId]);

  // Check authentication on mount only
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // Build user cards with operational data
  const userCards: UserCardData[] = useMemo(() => {
    const cards: UserCardData[] = [];
    
    // Owners
    const owner1Vessels = vessels.filter(v => v.ownerId === 'owner1');
    const owner2Vessels = vessels.filter(v => v.ownerId === 'owner2');
    
    cards.push({
      role: 'owner',
      name: 'John Smith',
      id: 'owner1',
      vessels: owner1Vessels.map(v => v.name),
      vesselIds: owner1Vessels.map(v => v.id),
      icon: 'crown.fill',
      iconAndroid: 'workspace_premium',
      color: colors.gold,
      statusPill: owner1Vessels[0]?.status === 'charter' ? 'On Charter' : 
                  owner1Vessels[0]?.status === 'docked' ? 'In Port' : 
                  owner1Vessels[0]?.status === 'maintenance' ? 'In Yard' : 'Active',
      statusColor: owner1Vessels[0]?.status === 'charter' ? colors.statusOnCharter :
                   owner1Vessels[0]?.status === 'docked' ? colors.statusInPort :
                   owner1Vessels[0]?.status === 'maintenance' ? colors.statusInYard : colors.success,
      operationalData: owner1Vessels[0]?.location || 'Monaco Yacht Club',
    });
    
    cards.push({
      role: 'owner',
      name: 'Emily Brown',
      id: 'owner2',
      vessels: owner2Vessels.map(v => v.name),
      vesselIds: owner2Vessels.map(v => v.id),
      icon: 'crown.fill',
      iconAndroid: 'workspace_premium',
      color: colors.gold,
      statusPill: owner2Vessels[0]?.status === 'charter' ? 'On Charter' : 
                  owner2Vessels[0]?.status === 'docked' ? 'In Port' : 
                  owner2Vessels[0]?.status === 'maintenance' ? 'In Yard' : 'Active',
      statusColor: owner2Vessels[0]?.status === 'charter' ? colors.statusOnCharter :
                   owner2Vessels[0]?.status === 'docked' ? colors.statusInPort :
                   owner2Vessels[0]?.status === 'maintenance' ? colors.statusInYard : colors.success,
      operationalData: owner2Vessels[0]?.location || 'Port of Miami',
    });
    
    // Managers
    const manager1Vessels = vessels.filter(v => v.managerId === 'manager1');
    const manager1Issues = issues.filter(i => manager1Vessels.some(v => v.id === i.vesselId));
    
    cards.push({
      role: 'manager',
      name: 'Sarah Johnson',
      id: 'manager1',
      vessels: manager1Vessels.map(v => v.name),
      vesselIds: manager1Vessels.map(v => v.id),
      icon: 'chart.bar.fill',
      iconAndroid: 'dashboard',
      color: colors.accent,
      statusPill: manager1Vessels[0]?.status === 'charter' ? 'On Charter' : 
                  manager1Vessels[0]?.status === 'docked' ? 'In Port' : 
                  manager1Vessels[0]?.status === 'maintenance' ? 'In Yard' : 'Active',
      statusColor: manager1Vessels[0]?.status === 'charter' ? colors.statusOnCharter :
                   manager1Vessels[0]?.status === 'docked' ? colors.statusInPort :
                   manager1Vessels[0]?.status === 'maintenance' ? colors.statusInYard : colors.success,
      operationalData: `${manager1Issues.length} issue${manager1Issues.length !== 1 ? 's' : ''} open`,
    });
    
    const manager2Vessels = vessels.filter(v => v.managerId === 'manager2');
    const manager2Issues = issues.filter(i => manager2Vessels.some(v => v.id === i.vesselId));
    
    cards.push({
      role: 'manager',
      name: 'Tom Wilson',
      id: 'manager2',
      vessels: manager2Vessels.map(v => v.name),
      vesselIds: manager2Vessels.map(v => v.id),
      icon: 'chart.bar.fill',
      iconAndroid: 'dashboard',
      color: colors.accent,
      statusPill: manager2Vessels[0]?.status === 'charter' ? 'On Charter' : 
                  manager2Vessels[0]?.status === 'docked' ? 'In Port' : 
                  manager2Vessels[0]?.status === 'maintenance' ? 'In Yard' : 'Active',
      statusColor: manager2Vessels[0]?.status === 'charter' ? colors.statusOnCharter :
                   manager2Vessels[0]?.status === 'docked' ? colors.statusInPort :
                   manager2Vessels[0]?.status === 'maintenance' ? colors.statusInYard : colors.success,
      operationalData: `${manager2Issues.length} issue${manager2Issues.length !== 1 ? 's' : ''} open`,
    });
    
    // Crew
    const crew1Vessels = vessels.filter(v => v.crewIds?.includes('crew1'));
    const crew1Tasks = maintenanceTasks.filter(t => t.assignedTo === 'crew1' && t.status !== 'completed');
    
    cards.push({
      role: 'crew',
      name: 'Mike Davis',
      id: 'crew1',
      vessels: crew1Vessels.map(v => v.name),
      vesselIds: crew1Vessels.map(v => v.id),
      icon: 'person.2.fill',
      iconAndroid: 'groups',
      color: colors.success,
      statusPill: crew1Vessels[0]?.status === 'charter' ? 'On Charter' : 
                  crew1Vessels[0]?.status === 'docked' ? 'In Port' : 
                  crew1Vessels[0]?.status === 'maintenance' ? 'In Yard' : 'Active',
      statusColor: crew1Vessels[0]?.status === 'charter' ? colors.statusOnCharter :
                   crew1Vessels[0]?.status === 'docked' ? colors.statusInPort :
                   crew1Vessels[0]?.status === 'maintenance' ? colors.statusInYard : colors.success,
      operationalData: `${crew1Tasks.length} task${crew1Tasks.length !== 1 ? 's' : ''} • Fuel 85% • Water 92%`,
    });
    
    const crew3Vessels = vessels.filter(v => v.crewIds?.includes('crew3'));
    const crew3Tasks = maintenanceTasks.filter(t => t.assignedTo === 'crew3' && t.status !== 'completed');
    
    cards.push({
      role: 'crew',
      name: 'Jane Smith',
      id: 'crew3',
      vessels: crew3Vessels.map(v => v.name),
      vesselIds: crew3Vessels.map(v => v.id),
      icon: 'person.2.fill',
      iconAndroid: 'groups',
      color: colors.success,
      statusPill: crew3Vessels[0]?.status === 'charter' ? 'On Charter' : 
                  crew3Vessels[0]?.status === 'docked' ? 'In Port' : 
                  crew3Vessels[0]?.status === 'maintenance' ? 'In Yard' : 'Active',
      statusColor: crew3Vessels[0]?.status === 'charter' ? colors.statusOnCharter :
                   crew3Vessels[0]?.status === 'docked' ? colors.statusInPort :
                   crew3Vessels[0]?.status === 'maintenance' ? colors.statusInYard : colors.success,
      operationalData: `${crew3Tasks.length} task${crew3Tasks.length !== 1 ? 's' : ''} • Fuel 78% • Water 88%`,
    });
    
    return cards;
  }, [vessels, issues, maintenanceTasks]);

  // Filter and search logic
  const filteredCards = useMemo(() => {
    let filtered = userCards;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(query) ||
        card.vessels.some(v => v.toLowerCase().includes(query)) ||
        card.role.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(card => {
        if (selectedFilter === 'Issues') {
          return card.operationalData.includes('issue');
        }
        return card.statusPill === selectedFilter;
      });
    }
    
    return filtered;
  }, [userCards, searchQuery, selectedFilter]);

  const handleRoleSelect = async (card: UserCardData) => {
    console.log('Role selected:', card.role, 'User ID:', card.id);
    
    // Animate press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    await setUserRole(card.role);
    await setUserName(card.name);
    await setUserId(card.id);
  };

  const handleInfoPress = (card: UserCardData) => {
    console.log('Info pressed for:', card.name);
    // TODO: Show quick details modal
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userName');
      
      await setUserRole(null);
      await setUserName('');
      await setUserId('');
      
      hasCheckedAuth.current = false;
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <IconSymbol 
          ios_icon_name="sailboat.fill" 
          android_material_icon_name="sailing" 
          size={64} 
          color={colors.gold} 
        />
        <Text style={[styles.headerTitle, { marginTop: 16 }]}>Vessel & Co.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <IconSymbol 
            ios_icon_name="sailboat.fill" 
            android_material_icon_name="sailing" 
            size={48} 
            color={colors.gold} 
          />
          <Text style={styles.headerTitle}>Vessel & Co.</Text>
          <Text style={styles.headerSubtitle}>Choose Your Vessel or Role</Text>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <IconSymbol 
            ios_icon_name="rectangle.portrait.and.arrow.right" 
            android_material_icon_name="logout" 
            size={20} 
            color={colors.text} 
          />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <IconSymbol 
              ios_icon_name="magnifyingglass" 
              android_material_icon_name="search" 
              size={20} 
              color={colors.textSecondary} 
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search vessel, owner, or crew"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
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

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTER_CHIPS.map((filter, index) => (
            <TouchableOpacity
              key={`filter-${index}`}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter && styles.filterChipTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* User Cards */}
        <View style={styles.cardsContainer}>
          {filteredCards.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol 
                ios_icon_name="magnifyingglass" 
                android_material_icon_name="search_off" 
                size={64} 
                color={colors.textMuted} 
              />
              <Text style={styles.emptyStateText}>No results found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filteredCards.map((card, index) => (
              <TouchableOpacity 
                key={`card-${index}`}
                style={styles.userCard}
                onPress={() => handleRoleSelect(card)}
                activeOpacity={0.8}
              >
                {/* Icon Circle */}
                <View style={[styles.iconCircle, { backgroundColor: card.color + '15' }]}>
                  <IconSymbol 
                    ios_icon_name={card.icon} 
                    android_material_icon_name={card.iconAndroid} 
                    size={28} 
                    color={card.color} 
                  />
                </View>

                {/* Card Content */}
                <View style={styles.cardContent}>
                  {/* Primary Title */}
                  <Text style={styles.cardTitle}>
                    {card.vessels.length > 0 ? card.vessels[0] : card.name}
                  </Text>
                  
                  {/* Subtitle Line 1: Role */}
                  <Text style={styles.cardRole}>
                    {card.role.charAt(0).toUpperCase() + card.role.slice(1)} • {card.name}
                  </Text>
                  
                  {/* Subtitle Line 2: Operational Data */}
                  <Text style={styles.cardOperational} numberOfLines={1}>
                    {card.operationalData}
                  </Text>
                </View>

                {/* Right Side: Status Pill & Info Icon */}
                <View style={styles.cardRight}>
                  <View style={[styles.statusPill, { backgroundColor: card.statusColor + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: card.statusColor }]} />
                    <Text style={[styles.statusText, { color: card.statusColor }]}>
                      {card.statusPill}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.infoButton}
                    onPress={() => handleInfoPress(card)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <IconSymbol 
                      ios_icon_name="info.circle" 
                      android_material_icon_name="info" 
                      size={22} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 60 : 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  
  // Search
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  
  // Filters
  filterContainer: {
    paddingBottom: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  filterChipTextActive: {
    color: colors.text,
  },
  
  // Cards
  cardsContainer: {
    gap: 14,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  cardRole: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  cardOperational: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
    lineHeight: 16,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  infoButton: {
    padding: 4,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textTertiary,
    marginTop: 8,
  },
});
