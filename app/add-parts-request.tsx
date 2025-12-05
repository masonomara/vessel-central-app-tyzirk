
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
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { ValidatedInput } from '@/components/ValidatedInput';
import { TaskPriority } from '@/types';
import { validateRequired, validatePositiveNumber } from '@/utils/validation';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const URGENCY_LEVELS: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

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
  const router = useRouter();
  const theme = useTheme();
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

  const selectedVessel = vessels.find(v => v.id === selectedVesselId);

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Parts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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

        <View style={styles.section}>
          <Text style={styles.label}>Part Number (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Manufacturer part number or model"
            placeholderTextColor={colors.textSecondary}
            value={partNumber}
            onChangeText={setPartNumber}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description of Issue *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the problem, symptoms, and why this part is needed..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
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
                <IconSymbol
                  ios_icon_name="sailboat.fill"
                  android_material_icon_name="sailing"
                  size={16}
                  color={selectedVesselId === vessel.id ? colors.text : colors.textSecondary}
                />
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
          <Text style={styles.label}>Location on Vessel *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {VESSEL_LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.optionChip,
                  vesselLocation === location && styles.optionChipActive,
                ]}
                onPress={() => setVesselLocation(location)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    vesselLocation === location && styles.optionChipTextActive,
                  ]}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Urgency Level *</Text>
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
                  {level.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {PART_CATEGORIES.map((cat) => (
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
          <Text style={styles.label}>Preferred Vendor (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Specific supplier or brand preference"
            placeholderTextColor={colors.textSecondary}
            value={preferredVendor}
            onChangeText={setPreferredVendor}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Estimated Cost (Optional)</Text>
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
          <Text style={styles.label}>Supporting Photos/Videos</Text>
          <Text style={styles.helperText}>
            Add photos or videos showing the issue or part needed
          </Text>
          
          <View style={styles.attachmentButtons}>
            <TouchableOpacity style={styles.attachButton} onPress={handlePickImage}>
              <IconSymbol
                ios_icon_name="photo.fill"
                android_material_icon_name="photo_library"
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

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <IconSymbol
            ios_icon_name="paperplane.fill"
            android_material_icon_name="send"
            size={20}
            color={colors.text}
          />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Parts Request'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  costInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
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
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
