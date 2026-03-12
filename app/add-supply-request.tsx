
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
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, formStyles } from '../styles/commonStyles';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { IconSymbol } from '../components/IconSymbol';
import { TaskPriority } from '../types';
import { getPriorityColor, PRIORITY_OPTIONS } from '../utils/formatting';
import { scrollProps } from '../hooks/useTopPadding';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const selectedVessel = vessels.find(v => v.id === selectedVesselId);

  const canSubmit =
    itemName.trim().length > 0 &&
    description.trim().length > 0 &&
    quantity.trim().length > 0 &&
    !isNaN(Number(quantity)) &&
    Number(quantity) > 0 &&
    estimatedCost.trim().length > 0 &&
    !isNaN(Number(estimatedCost)) &&
    Number(estimatedCost) >= 0 &&
    selectedVesselId.length > 0;

  if (userVessels.length === 0) {
    return (
      <View style={formStyles.container}>
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

  return (
    <KeyboardAvoidingView
      style={formStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen
        options={{
          title: 'Request Supplies',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={formStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={formStyles.scrollView}
        contentContainerStyle={[
          formStyles.scrollContent,
          { paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={formStyles.section}>
          <Text style={formStyles.label}>Item Name *</Text>
          <TextInput
            style={[formStyles.input, focusedField === 'itemName' && formStyles.inputFocused]}
            placeholder="What do you need?"
            placeholderTextColor={colors.textSecondary}
            value={itemName}
            onChangeText={setItemName}
            maxLength={100}
            onFocus={() => setFocusedField('itemName')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Description *</Text>
          <TextInput
            style={[formStyles.input, formStyles.textArea, focusedField === 'description' && formStyles.inputFocused]}
            placeholder="Detailed description, specifications, brand preferences..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <View style={formStyles.row}>
          <View style={[formStyles.section, formStyles.flex1]}>
            <Text style={formStyles.label}>Quantity *</Text>
            <TextInput
              style={[formStyles.input, focusedField === 'quantity' && formStyles.inputFocused]}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              onFocus={() => setFocusedField('quantity')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={[formStyles.section, formStyles.flex1]}>
            <Text style={formStyles.label}>Unit *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={formStyles.optionsContainer}
            >
              {UNIT_OPTIONS.slice(0, 3).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    formStyles.optionChip,
                    unit === u && formStyles.optionChipActive,
                  ]}
                  onPress={() => setUnit(u)}
                >
                  <Text
                    style={[
                      formStyles.optionChipText,
                      unit === u && formStyles.optionChipTextActive,
                    ]}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>All Units</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={formStyles.optionsContainer}
          >
            {UNIT_OPTIONS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[
                  formStyles.optionChip,
                  unit === u && formStyles.optionChipActive,
                ]}
                onPress={() => setUnit(u)}
              >
                <Text
                  style={[
                    formStyles.optionChipText,
                    unit === u && formStyles.optionChipTextActive,
                  ]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Estimated Cost (USD) *</Text>
          <View style={[formStyles.costInputContainer, focusedField === 'estimatedCost' && formStyles.inputFocused]}>
            <Text style={formStyles.currencySymbol}>$</Text>
            <TextInput
              style={[formStyles.input, formStyles.costInput]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={estimatedCost}
              onChangeText={setEstimatedCost}
              keyboardType="decimal-pad"
              onFocus={() => setFocusedField('estimatedCost')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Vessel *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={formStyles.optionsContainer}
          >
            {userVessels.map((vessel) => (
              <TouchableOpacity
                key={vessel.id}
                style={[
                  formStyles.optionChip,
                  selectedVesselId === vessel.id && formStyles.optionChipActive,
                ]}
                onPress={() => setSelectedVesselId(vessel.id)}
              >
                <Text
                  style={[
                    formStyles.optionChipText,
                    selectedVesselId === vessel.id && formStyles.optionChipTextActive,
                  ]}
                >
                  {vessel.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Priority *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={formStyles.optionsContainer}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  formStyles.optionChip,
                  priority === p && [
                    formStyles.optionChipActive,
                    { backgroundColor: getPriorityColor(p) },
                  ],
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    formStyles.optionChipText,
                    priority === p && formStyles.optionChipTextActive,
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={formStyles.optionsContainer}
          >
            {SUPPLY_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  formStyles.optionChip,
                  category === cat && formStyles.optionChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    formStyles.optionChipText,
                    category === cat && formStyles.optionChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Additional Notes</Text>
          <TextInput
            style={[formStyles.input, formStyles.textArea, focusedField === 'notes' && formStyles.inputFocused]}
            placeholder="Any additional information, preferred vendors, urgency details..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onFocus={() => setFocusedField('notes')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
      </ScrollView>

      <View style={[formStyles.bottomBar, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={[formStyles.submitButton, !canSubmit && formStyles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={formStyles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
