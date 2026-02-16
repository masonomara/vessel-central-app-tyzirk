
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
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { DocumentCategory } from '@/types';

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'manual',
  'insurance',
  'registration',
  'safety',
  'warranty',
  'invoice',
  'receipt',
  'other',
];

const COMMON_TAGS = [
  'legal',
  'required',
  'insurance',
  'safety',
  'manual',
  'warranty',
  'maintenance',
  'financial',
  'crew',
  'charter',
];

export default function AddDocumentScreen() {
  const router = useRouter();
  const { addDocument, vessels, getVesselsForUser } = useData();
  const { userId, userName, userRole } = useAuth();

  const userVessels = getVesselsForUser(userId, userRole || 'manager');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVesselId, setSelectedVesselId] = useState(userVessels[0]?.id || '');
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVessel = vessels.find(v => v.id === selectedVesselId);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedDocument(result.assets[0]);
        
        // Auto-fill title if empty
        if (!title && result.assets[0].name) {
          setTitle(result.assets[0].name.replace(/\.[^/.]+$/, ''));
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmedTag = customTag.trim().toLowerCase();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a document title.');
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

    if (!selectedDocument) {
      Alert.alert('Validation Error', 'Please select a document to upload.');
      return false;
    }

    // Validate expiry date format if provided
    if (expiryDate.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(expiryDate)) {
        Alert.alert('Validation Error', 'Please enter expiry date in YYYY-MM-DD format.');
        return false;
      }
      
      const date = new Date(expiryDate);
      if (isNaN(date.getTime())) {
        Alert.alert('Validation Error', 'Please enter a valid expiry date.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      addDocument({
        title: title.trim(),
        description: description.trim(),
        category,
        vesselId: selectedVesselId,
        vesselName: selectedVessel?.name || '',
        uploadedBy: userId,
        uploadedByName: userName,
        expiryDate: expiryDate.trim() ? new Date(expiryDate) : undefined,
        fileUri: selectedDocument!.uri,
        fileName: selectedDocument!.name,
        fileSize: selectedDocument!.size || 0,
        fileType: selectedDocument!.mimeType || 'application/octet-stream',
        tags: selectedTags,
        isImportant,
      });

      Alert.alert(
        'Success',
        'Document uploaded successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Upload Document',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={[styles.saveText, isSubmitting && { opacity: 0.5 }]}>Upload</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Select Document *</Text>
          <TouchableOpacity style={styles.documentPickerButton} onPress={handlePickDocument}>
            <IconSymbol
              ios_icon_name="doc.fill"
              android_material_icon_name="insert-drive-file"
              size={32}
              color={selectedDocument ? colors.success : colors.accent}
            />
            <View style={styles.documentPickerText}>
              <Text style={styles.documentPickerTitle}>
                {selectedDocument ? selectedDocument.name : 'Choose a file'}
              </Text>
              {selectedDocument && (
                <Text style={styles.documentPickerSubtitle}>
                  {formatFileSize(selectedDocument.size || 0)}
                </Text>
              )}
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Document Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Insurance Policy 2024"
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
            placeholder="Brief description of the document..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
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
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {DOCUMENT_CATEGORIES.map((cat) => (
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
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Expiry Date (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD (e.g., 2025-12-31)"
            placeholderTextColor={colors.textSecondary}
            value={expiryDate}
            onChangeText={setExpiryDate}
            maxLength={10}
          />
          <Text style={styles.helperText}>
            Leave empty if document does not expire
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tags</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {COMMON_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  selectedTags.includes(tag) && styles.tagChipActive,
                ]}
                onPress={() => handleToggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagChipText,
                    selectedTags.includes(tag) && styles.tagChipTextActive,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedTags.length > 0 && (
            <View style={styles.selectedTagsContainer}>
              <Text style={styles.selectedTagsLabel}>Selected Tags:</Text>
              <View style={styles.selectedTagsList}>
                {selectedTags.map((tag) => (
                  <View key={tag} style={styles.selectedTag}>
                    <Text style={styles.selectedTagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                      <IconSymbol
                        ios_icon_name="xmark.circle.fill"
                        android_material_icon_name="cancel"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.customTagContainer}>
            <TextInput
              style={[styles.input, styles.customTagInput]}
              placeholder="Add custom tag..."
              placeholderTextColor={colors.textSecondary}
              value={customTag}
              onChangeText={setCustomTag}
              maxLength={20}
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={handleAddCustomTag}
              disabled={!customTag.trim()}
            >
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={24}
                color={customTag.trim() ? colors.accent : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.importantToggle}
            onPress={() => setIsImportant(!isImportant)}
          >
            <View style={styles.importantToggleLeft}>
              <IconSymbol
                ios_icon_name={isImportant ? 'star.fill' : 'star'}
                android_material_icon_name={isImportant ? 'star' : 'star_border'}
                size={24}
                color={isImportant ? colors.gold : colors.textSecondary}
              />
              <Text style={styles.importantToggleText}>Mark as Important</Text>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                isImportant && styles.toggleSwitchActive,
              ]}
            >
              <View
                style={[
                  styles.toggleSwitchThumb,
                  isImportant && styles.toggleSwitchThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Uploading...' : 'Upload Document'}
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
    minHeight: 100,
    paddingTop: 14,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  documentPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  documentPickerText: {
    flex: 1,
  },
  documentPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  documentPickerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
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
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipActive: {
    backgroundColor: colors.accent + '30',
    borderColor: colors.accent,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tagChipTextActive: {
    color: colors.accent,
  },
  selectedTagsContainer: {
    marginTop: 12,
  },
  selectedTagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  selectedTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent + '30',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  customTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  customTagInput: {
    flex: 1,
  },
  addTagButton: {
    padding: 8,
  },
  importantToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  importantToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  importantToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: colors.gold,
  },
  toggleSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text,
  },
  toggleSwitchThumbActive: {
    alignSelf: 'flex-end',
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
