
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { TaskPriority, Attachment } from '@/types';

const ISSUE_CATEGORIES = [
  'Structural',
  'Electrical',
  'Plumbing',
  'Mechanical',
  'Safety',
  'Interior',
  'Exterior',
  'Navigation',
  'Communication',
  'Other',
];

const PRIORITY_OPTIONS: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export default function AddIssueScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { addIssue, vessels, getVesselsForUser } = useData();
  const { userId, userName, userRole } = useAuth();

  const userVessels = getVesselsForUser(userId, userRole || 'crew');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVesselId, setSelectedVesselId] = useState(userVessels[0]?.id || '');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Other');
  const [location, setLocation] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVessel = vessels.find(v => v.id === selectedVesselId);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newAttachments: Attachment[] = result.assets.map(asset => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: asset.fileName || `attachment_${Date.now()}`,
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          size: asset.fileSize || 0,
          uploadedBy: userId,
          uploadedAt: new Date(),
          mimeType: asset.mimeType,
        }));

        setAttachments([...attachments, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const newAttachment: Attachment = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: asset.fileName || `photo_${Date.now()}`,
          uri: asset.uri,
          type: 'image',
          size: asset.fileSize || 0,
          uploadedBy: userId,
          uploadedAt: new Date(),
          mimeType: asset.mimeType,
        };

        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter an issue title.');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description.');
      return false;
    }

    if (!selectedVesselId) {
      Alert.alert('Validation Error', 'Please select a vessel.');
      return false;
    }

    if (!location.trim()) {
      Alert.alert('Validation Error', 'Please enter the location on the vessel.');
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
      addIssue({
        title: title.trim(),
        description: description.trim(),
        vesselId: selectedVesselId,
        vesselName: selectedVessel?.name || '',
        reportedBy: userId,
        reportedByName: userName,
        assignedTo: null,
        assignedToName: null,
        status: 'open',
        priority,
        category,
        location: location.trim(),
        attachments,
        comments: [],
      });

      Alert.alert(
        'Success',
        'Issue reported successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting issue:', error);
      Alert.alert('Error', 'Failed to submit issue. Please try again.');
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
        <Text style={styles.headerTitle}>Report Issue</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Issue Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief description of the issue"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed description of the issue..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
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
            {ISSUE_CATEGORIES.map((cat) => (
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
          <Text style={styles.label}>Location on Vessel *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Forward Deck, Engine Room, Galley"
            placeholderTextColor={colors.textSecondary}
            value={location}
            onChangeText={setLocation}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Attachments (Photos/Videos)</Text>
          <View style={styles.attachmentButtons}>
            <TouchableOpacity style={styles.attachmentButton} onPress={handleTakePhoto}>
              <IconSymbol
                ios_icon_name="camera.fill"
                android_material_icon_name="photo_camera"
                size={24}
                color={colors.accent}
              />
              <Text style={styles.attachmentButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentButton} onPress={handlePickImage}>
              <IconSymbol
                ios_icon_name="photo.fill"
                android_material_icon_name="photo_library"
                size={24}
                color={colors.accent}
              />
              <Text style={styles.attachmentButtonText}>Choose from Library</Text>
            </TouchableOpacity>
          </View>

          {attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              {attachments.map((attachment) => (
                <View key={attachment.id} style={styles.attachmentItem}>
                  {attachment.type === 'image' ? (
                    <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                  ) : (
                    <View style={styles.videoPlaceholder}>
                      <IconSymbol
                        ios_icon_name="play.circle.fill"
                        android_material_icon_name="play_circle"
                        size={32}
                        color={colors.text}
                      />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeAttachmentButton}
                    onPress={() => handleRemoveAttachment(attachment.id)}
                  >
                    <IconSymbol
                      ios_icon_name="xmark.circle.fill"
                      android_material_icon_name="cancel"
                      size={24}
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
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Report Issue'}
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
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
  optionsContainer: {
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
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
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  attachmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  attachmentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  attachmentItem: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: colors.danger,
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
    fontWeight: '700',
    color: colors.text,
  },
});
