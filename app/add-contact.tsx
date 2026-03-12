import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { colors, formStyles } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { ContactType } from "../types";
import { scrollProps } from "../hooks/useTopPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CONTACT_TYPES: ContactType[] = [
  "crew",
  "vendor",
  "marina",
  "emergency",
  "owner",
  "other",
];

export default function AddContactScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addContact, vessels, getVesselsForUser } = useData();
  const { userId, userName, userRole } = useAuth();

  const userVessels = getVesselsForUser(userId, userRole || "crew");

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [contactType, setContactType] = useState<ContactType>("crew");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [selectedVesselIds, setSelectedVesselIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0;

  const toggleVessel = (vesselId: string) => {
    setSelectedVesselIds((prev) =>
      prev.includes(vesselId)
        ? prev.filter((id) => id !== vesselId)
        : [...prev, vesselId],
    );
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a contact name.");
      return false;
    }
    if (!phone.trim()) {
      Alert.alert("Validation Error", "Please enter a phone number.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const selectedVessels = userVessels.filter((v) =>
        selectedVesselIds.includes(v.id),
      );

      addContact({
        name: name.trim(),
        role: role.trim(),
        contactType,
        phone: phone.trim(),
        email: email.trim(),
        company: company.trim() || undefined,
        vesselIds: selectedVesselIds,
        vesselNames: selectedVessels.map((v) => v.name),
        notes: notes.trim(),
        createdBy: userId,
        createdByName: userName,
      });

      Alert.alert("Success", "Contact added successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error adding contact:", error);
      Alert.alert("Error", "Failed to add contact. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={formStyles.container}>
      <Stack.Screen
        options={{
          title: "Add Contact",
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
          contentContainerStyle={[
            formStyles.scrollContent,
            { paddingBottom: insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          <View style={formStyles.section}>
            <Text style={formStyles.label}>Name *</Text>
            <TextInput
              style={[formStyles.input, focusedField === "name" && formStyles.inputFocused]}
              placeholder="Contact name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              maxLength={100}
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Role</Text>
            <TextInput
              style={[formStyles.input, focusedField === "role" && formStyles.inputFocused]}
              placeholder="e.g., Captain, Electrician, Dock Master"
              placeholderTextColor={colors.textTertiary}
              value={role}
              onChangeText={setRole}
              onFocus={() => setFocusedField("role")}
              onBlur={() => setFocusedField(null)}
              maxLength={100}
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Contact Type *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={formStyles.optionsContainer}
            >
              {CONTACT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    formStyles.optionChip,
                    contactType === type && formStyles.optionChipActive,
                  ]}
                  onPress={() => setContactType(type)}
                >
                  <Text
                    style={[
                      formStyles.optionChipText,
                      contactType === type && formStyles.optionChipTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Phone *</Text>
            <TextInput
              style={[formStyles.input, focusedField === "phone" && formStyles.inputFocused]}
              placeholder="Phone number"
              placeholderTextColor={colors.textTertiary}
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              keyboardType="phone-pad"
              maxLength={20}
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Email</Text>
            <TextInput
              style={[formStyles.input, focusedField === "email" && formStyles.inputFocused]}
              placeholder="Email address"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={100}
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Company</Text>
            <TextInput
              style={[formStyles.input, focusedField === "company" && formStyles.inputFocused]}
              placeholder="Company name (optional)"
              placeholderTextColor={colors.textTertiary}
              value={company}
              onChangeText={setCompany}
              onFocus={() => setFocusedField("company")}
              onBlur={() => setFocusedField(null)}
              maxLength={100}
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Vessels</Text>
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
                    selectedVesselIds.includes(vessel.id) &&
                      formStyles.optionChipActive,
                  ]}
                  onPress={() => toggleVessel(vessel.id)}
                >
                  <Text
                    style={[
                      formStyles.optionChipText,
                      selectedVesselIds.includes(vessel.id) &&
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
              style={[formStyles.input, formStyles.textArea, focusedField === "notes" && formStyles.inputFocused]}
              placeholder="Additional notes..."
              placeholderTextColor={colors.textTertiary}
              value={notes}
              onChangeText={setNotes}
              onFocus={() => setFocusedField("notes")}
              onBlur={() => setFocusedField(null)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
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
              <Text style={formStyles.submitButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
