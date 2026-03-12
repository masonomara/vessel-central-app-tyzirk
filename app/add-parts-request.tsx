
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
import { ValidatedInput } from '../components/ValidatedInput';
import { TaskPriority } from '../types';
import { validateRequired, validatePositiveNumber } from '../utils/validation';
import { PRIORITY_OPTIONS } from '../utils/formatting';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { scrollProps } from '../hooks/useTopPadding';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const URGENCY_LEVELS = PRIORITY_OPTIONS;

const VESSEL_LOCATIONS = [
  'Engine Room',
  'Bridge',
  'Main Deck',
  'Upper Deck',
  'Lower Deck',
  'Galley',
  'Crew Quarters',
  'Guest Cabins',
  'Bow',
  'Stern',
  'Port Side',
  'Starboard Side',
  'Salon',
  'Tender Garage',
  'Other',
];

const PART_CATEGORIES = [
  'Engine Parts',
  'Electrical',
  'Plumbing',
  'Navigation Equipment',
  'Safety Equipment',
  'HVAC',
  'Hull & Deck',
  'Rigging',
  'Electronics',
  'Pumps & Filters',
  'Fuel System',
  'Hydraulics',
  'Other',
];

export default function AddPartsRequestScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addSupplyRequest, vessels, getVesselsForUser } = useData();
  const { userId, userName, userRole } = useAuth();

  const userVessels = getVesselsForUser(userId, userRole || 'crew');

  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [urgency, setUrgency] = useState<TaskPriority>('medium');
  const [selectedVesselId, setSelectedVesselId] = useState(userVessels[0]?.id || '');
  const [vesselLocation, setVesselLocation] = useState('Other');
  const [category, setCategory] = useState('Other');
  const [preferredVendor, setPreferredVendor] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [attachments, setAttachments] = useState<Array<{ uri: string; type: string; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const selectedVessel = vessels.find(v => v.id === selectedVesselId);

  const canSubmit =
    partName.trim().length > 0 &&
    description.trim().length > 0 &&
    quantity.trim().length > 0 &&
    !isNaN(Number(quantity)) &&
    Number(quantity) > 0 &&
    selectedVesselId.length > 0;

  if (userVessels.length === 0) {
    return (
      <View style={formStyles.container}>
        <Stack.Screen options={{ title: 'Request Parts' }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <IconSymbol ios_icon_name="sailboat" android_material_icon_name="sailing" size={48} color={colors.textTertiary} />
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
            No vessels assigned to your account. Contact your manager.
          </Text>
        </View>
      </View>
    );
  }

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          name: asset.fileName || `attachment_${Date.now()}.jpg`,
        }));
        setAttachments([...attachments, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map(asset => ({
          uri: asset.uri,
          type: 'document',
          name: asset.name,
        }));
        setAttachments([...attachments, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!partName.trim()) {
      Alert.alert('Validation Error', 'Please enter a part name.');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description of the issue.');
      return false;
    }

    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity.');
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
      const requestDescription = `${description}\n\n` +
        `Part Number: ${partNumber || 'N/A'}\n` +
        `Location: ${vesselLocation}\n` +
        `Category: ${category}` +
        (preferredVendor ? `\nPreferred Vendor: ${preferredVendor}` : '');

      addSupplyRequest({
        itemName: partName.trim(),
        description: requestDescription,
        quantity: Number(quantity),
        unit: 'units',
        estimatedCost: estimatedCost ? Number(estimatedCost) : 0,
        vesselId: selectedVesselId,
        vesselName: selectedVessel?.name || '',
        requestedBy: userId,
        requestedByName: userName,
        status: 'pending',
        priority: urgency,
        category: 'Parts',
        notes: `Part Request - ${category}`,
        attachments: attachments.map((att, index) => ({
          id: `${Date.now()}_${index}`,
          name: att.name,
          uri: att.uri,
          type: att.type as 'image' | 'video' | 'document' | 'pdf',
          size: 0,
          uploadedBy: userId,
          uploadedAt: new Date(),
        })),
        comments: [],
      });

      Alert.alert(
        'Success',
        'Parts request submitted successfully! Your manager will review it shortly.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting parts request:', error);
      Alert.alert('Error', 'Failed to submit parts request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (level: TaskPriority) => {
    switch (level) {
      case 'urgent': return colors.danger;
      case 'high': return colors.warning;
      case 'medium': return colors.accent;
      case 'low': return colors.success;
      default: return colors.grey;
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
          title: 'Request Parts',
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
        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.accent}
          />
          <Text style={styles.infoText}>
            Request parts needed for vessel maintenance and repairs. Include as much detail as possible.
          </Text>
        </View>

        <ValidatedInput
          label="Part Name"
          value={partName}
          onChangeText={setPartName}
          placeholder="e.g., Fuel Filter, Impeller, Circuit Breaker"
          validate={(value) => validateRequired(value, 'Part name')}
          validateOnBlur
          required
          leftIcon={{
            ios: 'wrench.fill',
            android: 'build',
          }}
        />

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Part Number (Optional)</Text>
          <TextInput
            style={[formStyles.input, focusedField === 'partNumber' && formStyles.inputFocused]}
            placeholder="Manufacturer part number or model"
            placeholderTextColor={colors.textSecondary}
            value={partNumber}
            onChangeText={setPartNumber}
            onFocus={() => setFocusedField('partNumber')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Description of Issue *</Text>
          <TextInput
            style={[formStyles.input, formStyles.textArea, focusedField === 'description' && formStyles.inputFocused]}
            placeholder="Describe the problem, symptoms, and why this part is needed..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <ValidatedInput
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          placeholder="How many units needed?"
          validate={(value) => validatePositiveNumber(value, 'Quantity')}
          validateOnBlur
          required
          keyboardType="numeric"
          leftIcon={{
            ios: 'number',
            android: 'tag',
          }}
        />

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
                <IconSymbol
                  ios_icon_name="sailboat.fill"
                  android_material_icon_name="sailing"
                  size={16}
                  color={selectedVesselId === vessel.id ? colors.text : colors.textSecondary}
                />
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
          <Text style={formStyles.label}>Location on Vessel *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={formStyles.optionsContainer}
          >
            {VESSEL_LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  formStyles.optionChip,
                  vesselLocation === location && formStyles.optionChipActive,
                ]}
                onPress={() => setVesselLocation(location)}
              >
                <Text
                  style={[
                    formStyles.optionChipText,
                    vesselLocation === location && formStyles.optionChipTextActive,
                  ]}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Urgency Level *</Text>
          <View style={styles.urgencyGrid}>
            {URGENCY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.urgencyCard,
                  urgency === level && [
                    styles.urgencyCardActive,
                    { borderColor: getUrgencyColor(level) },
                  ],
                ]}
                onPress={() => setUrgency(level)}
              >
                <View
                  style={[
                    styles.urgencyIndicator,
                    { backgroundColor: getUrgencyColor(level) },
                  ]}
                />
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === level && styles.urgencyTextActive,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={formStyles.optionsContainer}
          >
            {PART_CATEGORIES.map((cat) => (
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
          <Text style={formStyles.label}>Preferred Vendor (Optional)</Text>
          <TextInput
            style={[formStyles.input, focusedField === 'preferredVendor' && formStyles.inputFocused]}
            placeholder="Specific supplier or brand preference"
            placeholderTextColor={colors.textSecondary}
            value={preferredVendor}
            onChangeText={setPreferredVendor}
            onFocus={() => setFocusedField('preferredVendor')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Estimated Cost (Optional)</Text>
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
          <Text style={formStyles.label}>Supporting Photos/Videos</Text>
          <Text style={formStyles.helperText}>
            Add photos or videos showing the issue or part needed
          </Text>

          <View style={styles.attachmentButtons}>
            <TouchableOpacity style={styles.attachButton} onPress={handlePickImage}>
              <IconSymbol
                ios_icon_name="photo.fill"
                android_material_icon_name="photo-library"
                size={24}
                color={colors.text}
              />
              <Text style={styles.attachButtonText}>Add Photo/Video</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachButton} onPress={handlePickDocument}>
              <IconSymbol
                ios_icon_name="doc.fill"
                android_material_icon_name="description"
                size={24}
                color={colors.text}
              />
              <Text style={styles.attachButtonText}>Add Document</Text>
            </TouchableOpacity>
          </View>

          {attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              {attachments.map((attachment, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <IconSymbol
                    ios_icon_name={
                      attachment.type === 'image' ? 'photo.fill' :
                      attachment.type === 'video' ? 'video.fill' :
                      'doc.fill'
                    }
                    android_material_icon_name={
                      attachment.type === 'image' ? 'image' :
                      attachment.type === 'video' ? 'videocam' :
                      'description'
                    }
                    size={20}
                    color={colors.accent}
                  />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <TouchableOpacity onPress={() => removeAttachment(index)}>
                    <IconSymbol
                      ios_icon_name="xmark.circle.fill"
                      android_material_icon_name="cancel"
                      size={20}
                      color={colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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

const styles = StyleSheet.create({
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  urgencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  urgencyCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    gap: 12,
  },
  urgencyCardActive: {
    borderWidth: 2,
  },
  urgencyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  urgencyTextActive: {
    color: colors.text,
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  attachButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 8,
  },
  attachButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  attachmentsList: {
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceOne,
    borderRadius: 8,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
});
