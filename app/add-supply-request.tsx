
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '../styles/commonStyles';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { IconSymbol } from '../components/IconSymbol';
import { TaskPriority } from '../types';
import { useTopPadding } from '../hooks/useTopPadding';

const SUPPLY_CATEGORIES = [
  'Cleaning',
  'Maintenance',
  'Safety',
  'Provisions',
  'Fuel',
  'Parts',
  'Tools',
  'Electronics',
  'Linens',
  'Other',
];

const PRIORITY_OPTIONS: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

const UNIT_OPTIONS = [
  'units',
  'pieces',
  'liters',
  'gallons',
  'kilograms',
  'pounds',
  'boxes',
  'cases',
  'sets',
  'meters',
  'feet',
];

export default function AddSupplyRequestScreen() {
  const topPadding = useTopPadding();
  const router = useRouter();
  const { addSupplyRequest, vessels, getVesselsForUser } = useData();
  const { userId, userName, userRole } = useAuth();

  const userVessels = getVesselsForUser(userId, userRole || 'crew');

  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('units');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [selectedVesselId, setSelectedVesselId] = useState(userVessels[0]?.id || '');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Other');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVessel = vessels.find(v => v.id === selectedVesselId);

  if (userVessels.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
        <Stack.Screen options={{ title: 'Request Supplies' }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <IconSymbol ios_icon_name="sailboat" android_material_icon_name="sailing" size={48} color={colors.textTertiary} />
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
            No vessels assigned to your account. Contact your manager.
          </Text>
        </View>
      </View>
    );
  }

  const validateForm = (): boolean => {
    if (!itemName.trim()) {
      Alert.alert('Validation Error', 'Please enter an item name.');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description.');
      return false;
    }

    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity.');
      return false;
    }

    if (!estimatedCost.trim() || isNaN(Number(estimatedCost)) || Number(estimatedCost) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid estimated cost.');
      return false;
    }

    if (!selectedVesselId) {
      Alert.alert('Validation Error', 'Please select a vessel.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      addSupplyRequest({
        itemName: itemName.trim(),
        description: description.trim(),
        quantity: Number(quantity),
        unit,
        estimatedCost: Number(estimatedCost),
        vesselId: selectedVesselId,
        vesselName: selectedVessel?.name || '',
        requestedBy: userId,
        requestedByName: userName,
        status: 'pending',
        priority,
        category,
        notes: notes.trim(),
        attachments: [],
        comments: [],
      });

      Alert.alert(
        'Success',
        'Supply request submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting supply request:', error);
      Alert.alert('Error', 'Failed to submit supply request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'urgent': return colors.danger;
      case 'high': return colors.warning;
      case 'medium': return colors.accent;
      case 'low': return colors.success;
      default: return colors.grey;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen
        options={{
          title: 'Request Supplies',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={[styles.saveText, isSubmitting && { opacity: 0.5 }]}>Submit</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you need?"
            placeholderTextColor={colors.textSecondary}
            value={itemName}
            onChangeText={setItemName}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed description, specifications, brand preferences..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.label}>Unit *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.unitOptionsContainer}
            >
              {UNIT_OPTIONS.slice(0, 3).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.unitChip,
                    unit === u && styles.unitChipActive,
                  ]}
                  onPress={() => setUnit(u)}
                >
                  <Text
                    style={[
                      styles.unitChipText,
                      unit === u && styles.unitChipTextActive,
                    ]}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>All Units</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {UNIT_OPTIONS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[
                  styles.optionChip,
                  unit === u && styles.optionChipActive,
                ]}
                onPress={() => setUnit(u)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    unit === u && styles.optionChipTextActive,
                  ]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Estimated Cost (USD) *</Text>
          <View style={styles.costInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.costInput]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={estimatedCost}
              onChangeText={setEstimatedCost}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Vessel *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {userVessels.map((vessel) => (
              <TouchableOpacity
                key={vessel.id}
                style={[
                  styles.optionChip,
                  selectedVesselId === vessel.id && styles.optionChipActive,
                ]}
                onPress={() => setSelectedVesselId(vessel.id)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    selectedVesselId === vessel.id && styles.optionChipTextActive,
                  ]}
                >
                  {vessel.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Priority *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.optionChip,
                  priority === p && [
                    styles.optionChipActive,
                    { backgroundColor: getPriorityColor(p) },
                  ],
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    priority === p && styles.optionChipTextActive,
                  ]}
                >
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {SUPPLY_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.optionChip,
                  category === cat && styles.optionChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    category === cat && styles.optionChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional information, preferred vendors, urgency details..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  costInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  costInput: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 0,
  },
  optionsContainer: {
    gap: 8,
  },
  unitOptionsContainer: {
    gap: 6,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceOne,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionChipTextActive: {
    color: colors.text,
  },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surfaceOne,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  unitChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  unitChipTextActive: {
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
