
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '../styles/commonStyles';
import { useData } from '../contexts/DataContext';
import { IconSymbol } from '../components/IconSymbol';
import { Vessel } from '../types';

type AssignmentType = 'owner' | 'crew';

interface Assignment {
  vesselId: string;
  vesselName: string;
  userId: string;
  userName: string;
  type: AssignmentType;
}

export default function AssignBoatsScreen() {
  const theme = useTheme();
  const { 
    vessels, 
    assignOwnerToVessel, 
    removeOwnerFromVessel, 
    assignCrewToVessel, 
    removeCrewFromVessel 
  } = useData();
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('owner');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock users - in a real app, this would come from a database
  const mockOwners = [
    { id: 'owner1', name: 'John Smith' },
    { id: 'owner2', name: 'Emily Brown' },
    { id: 'owner3', name: 'Robert Johnson' },
  ];

  const mockCrew = [
    { id: 'crew1', name: 'Mike Davis' },
    { id: 'crew2', name: 'Sarah Wilson' },
    { id: 'crew3', name: 'Jane Smith' },
    { id: 'crew4', name: 'Tom Anderson' },
    { id: 'crew5', name: 'Lisa Martinez' },
  ];

  const filteredVessels = useMemo(() => {
    if (!searchQuery) {
      return vessels;
    }
    return vessels.filter(v =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vessels, searchQuery]);

  const handleAssignOwner = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setAssignmentType('owner');
    setShowAssignModal(true);
  };

  const handleAssignCrew = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setAssignmentType('crew');
    setShowAssignModal(true);
  };

  const handleConfirmAssignment = () => {
    if (!selectedVessel || !userId || !userName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (assignmentType === 'owner') {
      assignOwnerToVessel(selectedVessel.id, userId, userName);
    } else {
      assignCrewToVessel(selectedVessel.id, userId, userName);
    }

    Alert.alert(
      'Success',
      `${userName} has been assigned as ${assignmentType} to ${selectedVessel.name}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowAssignModal(false);
            setUserId('');
            setUserName('');
            setSelectedVessel(null);
          },
        },
      ]
    );
  };

  const handleRemoveOwner = (vessel: Vessel) => {
    Alert.alert(
      'Remove Owner',
      `Are you sure you want to remove the owner from ${vessel.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeOwnerFromVessel(vessel.id);
            Alert.alert('Success', 'Owner removed successfully');
          },
        },
      ]
    );
  };

  const handleRemoveCrew = (vessel: Vessel, crewId: string) => {
    Alert.alert(
      'Remove Crew Member',
      `Are you sure you want to remove this crew member from ${vessel.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeCrewFromVessel(vessel.id, crewId);
            Alert.alert('Success', 'Crew member removed successfully');
          },
        },
      ]
    );
  };

  const getOwnerName = (ownerId: string) => {
    const owner = mockOwners.find(o => o.id === ownerId);
    return owner ? owner.name : 'Unknown Owner';
  };

  const getCrewNames = (crewIds?: string[]) => {
    if (!crewIds || crewIds.length === 0) {
      return [];
    }
    return crewIds.map(id => {
      const crew = mockCrew.find(c => c.id === id);
      return { id, name: crew ? crew.name : 'Unknown' };
    });
  };

  const selectUser = (id: string, name: string) => {
    setUserId(id);
    setUserName(name);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Assign Boats' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.searchContainer}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vessels..."
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Boat Assignments</Text>
            <Text style={styles.headerSubtitle}>
              Manage owner and crew assignments for all vessels
            </Text>
          </View>

          {filteredVessels.map((vessel, index) => {
            const crewMembers = getCrewNames(vessel.crewIds);
            
            return (
              <View key={vessel.id} style={styles.vesselCard}>
                <View style={styles.vesselHeader}>
                  <View style={styles.vesselLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
                      <IconSymbol
                        ios_icon_name="sailboat.fill"
                        android_material_icon_name="sailing"
                        size={24}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.vesselInfo}>
                      <Text style={styles.vesselName}>{vessel.name}</Text>
                      <Text style={styles.vesselLocation}>{vessel.location}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    vessel.status === 'active' ? styles.statusActive : styles.statusMaintenance
                  ]}>
                    <Text style={[
                      styles.statusText,
                      vessel.status === 'active' ? styles.statusTextActive : styles.statusTextMaintenance
                    ]}>
                      {vessel.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.assignmentSection}>
                  <View style={styles.assignmentHeader}>
                    <View style={styles.assignmentTitleRow}>
                      <IconSymbol
                        ios_icon_name="person.fill"
                        android_material_icon_name="person"
                        size={18}
                        color={colors.accent}
                      />
                      <Text style={styles.assignmentTitle}>Owner</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => handleAssignOwner(vessel)}
                    >
                      <IconSymbol
                        ios_icon_name="plus.circle.fill"
                        android_material_icon_name="add-circle"
                        size={20}
                        color={colors.accent}
                      />
                    </TouchableOpacity>
                  </View>
                  {vessel.ownerId ? (
                    <View style={styles.assignmentItem}>
                      <Text style={styles.assignmentName}>{getOwnerName(vessel.ownerId)}</Text>
                      <TouchableOpacity onPress={() => handleRemoveOwner(vessel)}>
                        <IconSymbol
                          ios_icon_name="xmark.circle.fill"
                          android_material_icon_name="cancel"
                          size={20}
                          color={colors.danger}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>No owner assigned</Text>
                  )}
                </View>

                <View style={styles.assignmentSection}>
                  <View style={styles.assignmentHeader}>
                    <View style={styles.assignmentTitleRow}>
                      <IconSymbol
                        ios_icon_name="person.2.fill"
                        android_material_icon_name="groups"
                        size={18}
                        color={colors.accent}
                      />
                      <Text style={styles.assignmentTitle}>Crew ({crewMembers.length})</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => handleAssignCrew(vessel)}
                    >
                      <IconSymbol
                        ios_icon_name="plus.circle.fill"
                        android_material_icon_name="add-circle"
                        size={20}
                        color={colors.accent}
                      />
                    </TouchableOpacity>
                  </View>
                  {crewMembers.length > 0 ? (
                    <React.Fragment>
                      {crewMembers.map((crew, crewIndex) => (
                        <View key={crew.id} style={styles.assignmentItem}>
                          <Text style={styles.assignmentName}>{crew.name}</Text>
                          <TouchableOpacity onPress={() => handleRemoveCrew(vessel, crew.id)}>
                            <IconSymbol
                              ios_icon_name="xmark.circle.fill"
                              android_material_icon_name="cancel"
                              size={20}
                              color={colors.danger}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </React.Fragment>
                  ) : (
                    <Text style={styles.emptyText}>No crew assigned</Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <Modal
          visible={showAssignModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAssignModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Assign {assignmentType === 'owner' ? 'Owner' : 'Crew Member'}
                </Text>
                <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={28}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {selectedVessel && (
                <View style={styles.vesselPreview}>
                  <IconSymbol
                    ios_icon_name="sailboat.fill"
                    android_material_icon_name="sailing"
                    size={20}
                    color={colors.accent}
                  />
                  <Text style={styles.vesselPreviewText}>{selectedVessel.name}</Text>
                </View>
              )}

              <Text style={styles.modalLabel}>
                Select {assignmentType === 'owner' ? 'Owner' : 'Crew Member'}
              </Text>

              <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
                {(assignmentType === 'owner' ? mockOwners : mockCrew).map((user, index) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.userItem,
                      userId === user.id && styles.userItemSelected,
                    ]}
                    onPress={() => selectUser(user.id, user.name)}
                  >
                    <View style={styles.userItemLeft}>
                      <View style={[
                        styles.userAvatar,
                        { backgroundColor: colors.accent + '30' }
                      ]}>
                        <Text style={styles.userAvatarText}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <Text style={styles.userItemName}>{user.name}</Text>
                    </View>
                    {userId === user.id && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={24}
                        color={colors.success}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAssignModal(false);
                    setUserId('');
                    setUserName('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    (!userId || !userName) && styles.confirmButtonDisabled,
                  ]}
                  onPress={handleConfirmAssignment}
                  disabled={!userId || !userName}
                >
                  <Text style={styles.confirmButtonText}>Assign</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  vesselCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vesselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  vesselLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vesselInfo: {
    flex: 1,
  },
  vesselName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  vesselLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: colors.success + '30',
  },
  statusMaintenance: {
    backgroundColor: colors.warning + '30',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextMaintenance: {
    color: colors.warning,
  },
  assignmentSection: {
    marginBottom: 16,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  assignButton: {
    padding: 4,
  },
  assignmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  assignmentName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  vesselPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  vesselPreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  userList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userItemSelected: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  userItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  userItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButton: {
    backgroundColor: colors.accent,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
