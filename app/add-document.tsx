import React, { useState } from "react";
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
  Switch,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { colors, formStyles } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { IconSymbol } from "../components/IconSymbol";
import { DocumentCategory } from "../types";
import { formatFileSize } from "../utils/formatting";
import { scrollProps } from "../hooks/useTopPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  "manual",
  "insurance",
  "registration",
  "safety",
  "warranty",
  "invoice",
  "receipt",
  "other",
];

const COMMON_TAGS = [
  "legal",
  "required",
  "insurance",
  "safety",
  "manual",
  "warranty",
  "maintenance",
  "financial",
  "crew",
  "charter",
];

export default function AddDocumentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addDocument, vessels, getVesselsForUser } = useData();
  const { userId, userName, userRole } = useAuth();

  const userVessels = getVesselsForUser(userId, userRole || "manager");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedVesselId, setSelectedVesselId] = useState(
    userVessels[0]?.id || "",
  );
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const selectedVessel = vessels.find((v) => v.id === selectedVesselId);

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    selectedVesselId.length > 0 &&
    selectedDocument !== null;

  if (userVessels.length === 0) {
    return (
      <View style={formStyles.container}>
        <Stack.Screen options={{ title: "Upload Document" }} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          <IconSymbol
            ios_icon_name="sailboat"
            android_material_icon_name="sailing"
            size={48}
            color={colors.textTertiary}
          />
          <Text
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            No vessels assigned to your account. Contact your manager.
          </Text>
        </View>
      </View>
    );
  }

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedDocument(result.assets[0]);

        if (!title && result.assets[0].name) {
          setTitle(result.assets[0].name.replace(/\.[^/.]+$/, ""));
        }
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmedTag = customTag.trim().toLowerCase();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a document title.");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Validation Error", "Please enter a description.");
      return false;
    }
    if (!selectedVesselId) {
      Alert.alert("Validation Error", "Please select a vessel.");
      return false;
    }
    if (!selectedDocument) {
      Alert.alert("Validation Error", "Please select a document to upload.");
      return false;
    }
    if (expiryDate.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(expiryDate)) {
        Alert.alert(
          "Validation Error",
          "Please enter expiry date in YYYY-MM-DD format.",
        );
        return false;
      }
      const date = new Date(expiryDate);
      if (isNaN(date.getTime())) {
        Alert.alert("Validation Error", "Please enter a valid expiry date.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!selectedDocument) return;

    setIsSubmitting(true);

    try {
      addDocument({
        title: title.trim(),
        description: description.trim(),
        category,
        vesselId: selectedVesselId,
        vesselName: selectedVessel?.name || "",
        uploadedBy: userId,
        uploadedByName: userName,
        expiryDate: expiryDate.trim() ? new Date(expiryDate) : undefined,
        fileUri: selectedDocument.uri,
        fileName: selectedDocument.name,
        fileSize: selectedDocument.size || 0,
        fileType: selectedDocument.mimeType || "application/octet-stream",
        tags: selectedTags,
        isImportant,
        comments: [],
      });

      Alert.alert("Success", "Document uploaded successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error uploading document:", error);
      Alert.alert("Error", "Failed to upload document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={formStyles.container}>
      <Stack.Screen
        options={{
          title: "Upload Document",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={formStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={formStyles.scrollView}
          contentContainerStyle={formStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          <View style={formStyles.section}>
            <Text style={formStyles.label}>Select Document *</Text>
            <TouchableOpacity
              style={styles.documentPickerButton}
              onPress={handlePickDocument}
            >
              <IconSymbol
                ios_icon_name="doc.fill"
                android_material_icon_name="insert-drive-file"
                size={32}
                color={selectedDocument ? colors.success : colors.accent}
              />
              <View style={styles.documentPickerText}>
                <Text style={styles.documentPickerTitle}>
                  {selectedDocument ? selectedDocument.name : "Choose a file"}
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

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Document Title *</Text>
            <TextInput
              style={[
                formStyles.input,
                focusedField === "title" && formStyles.inputFocused,
              ]}
              placeholder="e.g., Insurance Policy 2024"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Description *</Text>
            <TextInput
              style={[
                formStyles.input,
                formStyles.textArea,
                focusedField === "description" && formStyles.inputFocused,
              ]}
              placeholder="Brief description of the document..."
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={() => setFocusedField("description")}
              onBlur={() => setFocusedField(null)}
            />
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
                    selectedVesselId === vessel.id &&
                      formStyles.optionChipActive,
                  ]}
                  onPress={() => setSelectedVesselId(vessel.id)}
                >
                  <Text
                    style={[
                      formStyles.optionChipText,
                      selectedVesselId === vessel.id &&
                        formStyles.optionChipTextActive,
                    ]}
                  >
                    {vessel.name}
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
              {DOCUMENT_CATEGORIES.map((cat) => (
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
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Expiry Date (Optional)</Text>
            <TextInput
              style={[
                formStyles.input,
                focusedField === "expiryDate" && formStyles.inputFocused,
              ]}
              placeholder="YYYY-MM-DD (e.g., 2025-12-31)"
              placeholderTextColor={colors.textTertiary}
              value={expiryDate}
              onChangeText={setExpiryDate}
              maxLength={10}
              onFocus={() => setFocusedField("expiryDate")}
              onBlur={() => setFocusedField(null)}
            />
            <Text style={formStyles.helperText}>
              Leave empty if document does not expire
            </Text>
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Tags</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={formStyles.optionsContainer}
            >
              {COMMON_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    formStyles.optionChip,
                    selectedTags.includes(tag) && formStyles.optionChipActive,
                  ]}
                  onPress={() => handleToggleTag(tag)}
                >
                  <Text
                    style={[
                      formStyles.optionChipText,
                      selectedTags.includes(tag) &&
                        formStyles.optionChipTextActive,
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
                style={[
                  formStyles.input,
                  { flex: 1 },
                  focusedField === "customTag" && formStyles.inputFocused,
                ]}
                placeholder="Add custom tag..."
                placeholderTextColor={colors.textTertiary}
                value={customTag}
                onChangeText={setCustomTag}
                maxLength={20}
                onFocus={() => setFocusedField("customTag")}
                onBlur={() => setFocusedField(null)}
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

          <View style={formStyles.section}>
            <View style={formStyles.switchRow}>
              <Text style={formStyles.label}>Mark as Important</Text>
              <Switch
                value={isImportant}
                onValueChange={setIsImportant}
                trackColor={{ false: colors.borderSoft, true: colors.text }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            formStyles.bottomBar,
            { paddingBottom: insets.bottom },
          ]}
        >
          <TouchableOpacity
            style={[
              formStyles.submitButton,
              !canSubmit && formStyles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={formStyles.submitButtonText}>Upload</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  documentPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.container,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 12,
  },
  documentPickerText: {
    flex: 1,
  },
  documentPickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  documentPickerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedTagsContainer: {
    marginTop: 12,
  },
  selectedTagsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  selectedTagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accent + "30",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
  },
  customTagContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  addTagButton: {
    padding: 8,
  },
});
