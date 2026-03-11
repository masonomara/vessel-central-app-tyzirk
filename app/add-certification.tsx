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
} from "react-native";
import { Stack, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { scrollProps } from "../hooks/useTopPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CREW_OPTIONS = [
  { id: "crew1", name: "Marcus Rivera" },
  { id: "crew2", name: "Tanya Brooks" },
];

export default function AddCertificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addCertification, vessels, getVesselsForUser } = useData();
  const { userId, userName, userRole } = useAuth();

  const userVessels = getVesselsForUser(userId, userRole || "crew");

  const [crewId, setCrewId] = useState("");
  const [crewName, setCrewName] = useState("");
  const [certType, setCertType] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [selectedVesselId, setSelectedVesselId] = useState(
    userVessels[0]?.id || "",
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

  const selectedVessel = userVessels.find((v) => v.id === selectedVesselId);

  const selectCrew = (id: string, name: string) => {
    setCrewId(id);
    setCrewName(name);
  };

  const handleIssueDateChange = (_: unknown, selectedDate?: Date) => {
    setShowIssueDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setIssueDate(selectedDate);
    }
  };

  const handleExpiryDateChange = (_: unknown, selectedDate?: Date) => {
    setShowExpiryDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const validateForm = (): boolean => {
    if (!crewId) {
      Alert.alert("Validation Error", "Please select a crew member.");
      return false;
    }
    if (!certType.trim()) {
      Alert.alert("Validation Error", "Please enter a certification type.");
      return false;
    }
    if (!issuingAuthority.trim()) {
      Alert.alert("Validation Error", "Please enter the issuing authority.");
      return false;
    }
    if (!selectedVesselId) {
      Alert.alert("Validation Error", "Please select a vessel.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      addCertification({
        crewId,
        crewName,
        certType: certType.trim(),
        issuingAuthority: issuingAuthority.trim(),
        certificateNumber: certificateNumber.trim() || undefined,
        issueDate,
        expiryDate,
        vesselId: selectedVesselId,
        vesselName: selectedVessel?.name || "",
        notes: notes.trim(),
        createdBy: userId,
        createdByName: userName,
      });

      Alert.alert("Success", "Certification added successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error adding certification:", error);
      Alert.alert("Error", "Failed to add certification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen
        options={{
          title: "Add Certification",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
              <Text
                style={[styles.saveText, isSubmitting && { opacity: 0.5 }]}
              >
                Save
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 64 },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Crew Member *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {CREW_OPTIONS.map((crew) => (
              <TouchableOpacity
                key={crew.id}
                style={[
                  styles.optionChip,
                  crewId === crew.id && styles.optionChipActive,
                ]}
                onPress={() => selectCrew(crew.id, crew.name)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    crewId === crew.id && styles.optionChipTextActive,
                  ]}
                >
                  {crew.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Certification Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., STCW, MCA Yacht Rating"
            placeholderTextColor={colors.textSecondary}
            value={certType}
            onChangeText={setCertType}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Issuing Authority *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., MCA, USCG, RYA"
            placeholderTextColor={colors.textSecondary}
            value={issuingAuthority}
            onChangeText={setIssuingAuthority}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Certificate Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Certificate number (optional)"
            placeholderTextColor={colors.textSecondary}
            value={certificateNumber}
            onChangeText={setCertificateNumber}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Issue Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowIssueDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formatDisplayDate(issueDate)}
            </Text>
          </TouchableOpacity>
          {showIssueDatePicker && (
            <DateTimePicker
              value={issueDate}
              mode="date"
              onChange={handleIssueDateChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Expiry Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowExpiryDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formatDisplayDate(expiryDate)}
            </Text>
          </TouchableOpacity>
          {showExpiryDatePicker && (
            <DateTimePicker
              value={expiryDate}
              mode="date"
              onChange={handleExpiryDateChange}
            />
          )}
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
                    selectedVesselId === vessel.id &&
                      styles.optionChipTextActive,
                  ]}
                >
                  {vessel.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional notes..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Saving..." : "Add Certification"}
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
    fontWeight: "600",
    color: colors.accent,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
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
  optionsContainer: {
    gap: 8,
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
    fontWeight: "600",
    color: colors.textSecondary,
  },
  optionChipTextActive: {
    color: colors.text,
  },
  dateButton: {
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
