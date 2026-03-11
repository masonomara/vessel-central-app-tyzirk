import React, { useState } from "react";
import {
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
import { colors, formStyles } from "../styles/commonStyles";
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
    <View style={formStyles.container}>
      <Stack.Screen
        options={{
          title: "Add Certification",
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
                Save
              </Text>
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
          <Text style={formStyles.label}>Crew Member *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={formStyles.optionsContainer}
          >
            {CREW_OPTIONS.map((crew) => (
              <TouchableOpacity
                key={crew.id}
                style={[
                  formStyles.optionChip,
                  crewId === crew.id && formStyles.optionChipActive,
                ]}
                onPress={() => selectCrew(crew.id, crew.name)}
              >
                <Text
                  style={[
                    formStyles.optionChipText,
                    crewId === crew.id && formStyles.optionChipTextActive,
                  ]}
                >
                  {crew.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Certification Type *</Text>
          <TextInput
            style={formStyles.input}
            placeholder="e.g., STCW, MCA Yacht Rating"
            placeholderTextColor={colors.textTertiary}
            value={certType}
            onChangeText={setCertType}
            maxLength={100}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Issuing Authority *</Text>
          <TextInput
            style={formStyles.input}
            placeholder="e.g., MCA, USCG, RYA"
            placeholderTextColor={colors.textTertiary}
            value={issuingAuthority}
            onChangeText={setIssuingAuthority}
            maxLength={100}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Certificate Number</Text>
          <TextInput
            style={formStyles.input}
            placeholder="Certificate number (optional)"
            placeholderTextColor={colors.textTertiary}
            value={certificateNumber}
            onChangeText={setCertificateNumber}
            maxLength={50}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Issue Date *</Text>
          <TouchableOpacity
            style={formStyles.dateButton}
            onPress={() => setShowIssueDatePicker(true)}
          >
            <Text style={formStyles.dateButtonText}>
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

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Expiry Date *</Text>
          <TouchableOpacity
            style={formStyles.dateButton}
            onPress={() => setShowExpiryDatePicker(true)}
          >
            <Text style={formStyles.dateButtonText}>
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
          <Text style={formStyles.label}>Notes</Text>
          <TextInput
            style={[formStyles.input, formStyles.textArea]}
            placeholder="Additional notes..."
            placeholderTextColor={colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </View>
  );
}
