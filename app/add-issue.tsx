import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { colors, formStyles } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { IconSymbol } from "../components/IconSymbol";
import { TaskPriority, Attachment } from "../types";
import { optimizeImage } from "../utils/files";
import { validateImage } from "../utils/validation";
import {
  formatFileSize,
  getPriorityColor,
  PRIORITY_OPTIONS,
} from "../utils/formatting";
import { scrollProps } from "../hooks/useTopPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ISSUE_CATEGORIES = [
  "Structural",
  "Electrical",
  "Plumbing",
  "Mechanical",
  "Safety",
  "Interior",
  "Exterior",
  "Navigation",
  "Communication",
  "Other",
];

export default function AddIssueScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addIssue, vessels, getVesselsForUser } = useData();
  const { userId, userName, userRole } = useAuth();

  const userVessels = getVesselsForUser(userId, userRole || "crew");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedVesselId, setSelectedVesselId] = useState(
    userVessels[0]?.id || "",
  );
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState("Other");
  const [location, setLocation] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState({
    current: 0,
    total: 0,
  });

  const selectedVessel = vessels.find((v) => v.id === selectedVesselId);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        setIsOptimizing(true);
        setOptimizationProgress({ current: 0, total: result.assets.length });

        const newAttachments: Attachment[] = [];

        for (let i = 0; i < result.assets.length; i++) {
          const asset = result.assets[i];

          setOptimizationProgress({
            current: i + 1,
            total: result.assets.length,
          });

          if (asset.type === "video") {
            newAttachments.push({
              id:
                Date.now().toString() +
                Math.random().toString(36).substr(2, 9),
              name: asset.fileName || `video_${Date.now()}`,
              uri: asset.uri,
              type: "video",
              size: asset.fileSize || 0,
              uploadedBy: userId,
              uploadedAt: new Date(),
              mimeType: asset.mimeType,
            });
          } else {
            const validation = validateImage(asset.mimeType, asset.fileSize);
            if (!validation.valid) {
              Alert.alert(
                "Invalid Image",
                validation.message || "Image validation failed",
              );
              continue;
            }

            try {
              const optimized = await optimizeImage(asset.uri, {
                maxWidth: 1920,
                maxHeight: 1920,
                quality: 0.8,
                format: "jpeg",
              });

              newAttachments.push({
                id:
                  Date.now().toString() +
                  Math.random().toString(36).substr(2, 9),
                name: asset.fileName || `photo_${Date.now()}`,
                uri: optimized.uri,
                type: "image",
                size: optimized.size || 0,
                uploadedBy: userId,
                uploadedAt: new Date(),
                mimeType: "image/jpeg",
              });
            } catch {
              newAttachments.push({
                id:
                  Date.now().toString() +
                  Math.random().toString(36).substr(2, 9),
                name: asset.fileName || `photo_${Date.now()}`,
                uri: asset.uri,
                type: "image",
                size: asset.fileSize || 0,
                uploadedBy: userId,
                uploadedAt: new Date(),
                mimeType: asset.mimeType,
              });
            }
          }
        }

        setAttachments([...attachments, ...newAttachments]);
        setIsOptimizing(false);
        setOptimizationProgress({ current: 0, total: 0 });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setIsOptimizing(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to take photos.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        const validation = validateImage(asset.mimeType, asset.fileSize);
        if (!validation.valid) {
          Alert.alert(
            "Invalid Image",
            validation.message || "Image validation failed",
          );
          return;
        }

        setIsOptimizing(true);

        try {
          const optimized = await optimizeImage(asset.uri, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.8,
            format: "jpeg",
          });

          const newAttachment: Attachment = {
            id:
              Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: asset.fileName || `photo_${Date.now()}`,
            uri: optimized.uri,
            type: "image",
            size: optimized.size || 0,
            uploadedBy: userId,
            uploadedAt: new Date(),
            mimeType: "image/jpeg",
          };

          setAttachments([...attachments, newAttachment]);
        } catch {
          const newAttachment: Attachment = {
            id:
              Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: asset.fileName || `photo_${Date.now()}`,
            uri: asset.uri,
            type: "image",
            size: asset.fileSize || 0,
            uploadedBy: userId,
            uploadedAt: new Date(),
            mimeType: asset.mimeType,
          };

          setAttachments([...attachments, newAttachment]);
        } finally {
          setIsOptimizing(false);
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
      setIsOptimizing(false);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter an issue title.");
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
    if (!location.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter the location on the vessel.",
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      addIssue({
        title: title.trim(),
        description: description.trim(),
        vesselId: selectedVesselId,
        vesselName: selectedVessel?.name || "",
        reportedBy: userId,
        reportedByName: userName,
        assignedTo: null,
        assignedToName: null,
        status: "open",
        priority,
        category,
        location: location.trim(),
        attachments,
        comments: [],
      });

      Alert.alert("Success", "Issue reported successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error submitting issue:", error);
      Alert.alert("Error", "Failed to submit issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userVessels.length === 0) {
    return (
      <View style={formStyles.container}>
        <Stack.Screen options={{ title: "Report Issue" }} />
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

  return (
    <View style={formStyles.container}>
      <Stack.Screen
        options={{
          title: "Report Issue",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={formStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
              <Text
                style={[formStyles.saveText, isSubmitting && { opacity: 0.5 }]}
              >
                Submit
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      {isOptimizing && (
        <View style={styles.optimizingOverlay}>
          <View style={styles.optimizingCard}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.optimizingText}>Optimizing images...</Text>
            {optimizationProgress.total > 0 && (
              <Text style={styles.optimizingProgress}>
                {optimizationProgress.current} / {optimizationProgress.total}
              </Text>
            )}
          </View>
        </View>
      )}

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
          <Text style={formStyles.label}>Issue Title *</Text>
          <TextInput
            style={formStyles.input}
            placeholder="Brief description of the issue"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Description *</Text>
          <TextInput
            style={[formStyles.input, formStyles.textArea]}
            placeholder="Detailed description of the issue..."
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
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
                  selectedVesselId === vessel.id && formStyles.optionChipActive,
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
                    { borderColor: getPriorityColor(p) },
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
                  {p.toUpperCase()}
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
            {ISSUE_CATEGORIES.map((cat) => (
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
          <Text style={formStyles.label}>Location on Vessel *</Text>
          <TextInput
            style={formStyles.input}
            placeholder="e.g., Forward Deck, Engine Room, Galley"
            placeholderTextColor={colors.textTertiary}
            value={location}
            onChangeText={setLocation}
            maxLength={100}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Attachments (Photos/Videos)</Text>
          <View style={styles.attachmentButtons}>
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleTakePhoto}
              disabled={isOptimizing}
            >
              <IconSymbol
                ios_icon_name="camera.fill"
                android_material_icon_name="photo-camera"
                size={24}
                color={isOptimizing ? colors.textSecondary : colors.accent}
              />
              <Text
                style={[
                  styles.attachmentButtonText,
                  isOptimizing && styles.attachmentButtonTextDisabled,
                ]}
              >
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handlePickImage}
              disabled={isOptimizing}
            >
              <IconSymbol
                ios_icon_name="photo.fill"
                android_material_icon_name="photo-library"
                size={24}
                color={isOptimizing ? colors.textSecondary : colors.accent}
              />
              <Text
                style={[
                  styles.attachmentButtonText,
                  isOptimizing && styles.attachmentButtonTextDisabled,
                ]}
              >
                Choose from Library
              </Text>
            </TouchableOpacity>
          </View>

          {attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              {attachments.map((attachment) => (
                <View key={attachment.id} style={styles.attachmentItem}>
                  {attachment.type === "image" ? (
                    <Image
                      source={{ uri: attachment.uri }}
                      style={styles.attachmentImage}
                    />
                  ) : (
                    <View style={styles.videoPlaceholder}>
                      <IconSymbol
                        ios_icon_name="play.circle.fill"
                        android_material_icon_name="play-circle"
                        size={32}
                        color={colors.text}
                      />
                    </View>
                  )}
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentSize}>
                      {formatFileSize(attachment.size)}
                    </Text>
                  </View>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  optimizingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  optimizingCard: {
    backgroundColor: colors.surfaceOne,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  optimizingText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  optimizingProgress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  attachmentButtons: {
    flexDirection: "row",
    gap: 12,
  },
  attachmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.container,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachmentButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accent,
  },
  attachmentButtonTextDisabled: {
    color: colors.textSecondary,
  },
  attachmentsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  attachmentItem: {
    position: "relative",
    width: 100,
    height: 100,
  },
  attachmentImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  videoPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: colors.surfaceOne,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 4,
  },
  attachmentSize: {
    fontSize: 10,
    color: colors.text,
    textAlign: "center",
  },
  removeAttachmentButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
  },
});
