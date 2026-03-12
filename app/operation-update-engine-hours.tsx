import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { colors, formStyles } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scrollProps } from "../hooks/useTopPadding";

export default function UpdateEngineHoursScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { vesselId } = useLocalSearchParams();
  const { vessels, updateEngineHours } = useData();
  const { userId, userName, userRole } = useAuth();

  const vessel = vessels.find(v => v.id === vesselId);
  const currentHours = vessel?.engineHours || 0;

  const [newHours, setNewHours] = useState("");
  const [notes, setNotes] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = newHours.trim() && !isNaN(parseInt(newHours, 10)) && parseInt(newHours, 10) >= currentHours;

  const handleSubmit = () => {
    const hours = parseInt(newHours, 10);
    if (isNaN(hours) || hours < currentHours) {
      Alert.alert("Invalid Hours", `Engine hours must be at least ${currentHours}.`);
      return;
    }
    if (!userId || !userName || !userRole) return;
    setIsSubmitting(true);
    updateEngineHours(vesselId as string, hours, userId, userName, userRole, notes);
    Alert.alert("Updated", "Engine hours have been updated.", [{ text: "OK", onPress: () => router.back() }]);
  };

  if (!vessel) {
    return (
      <View style={formStyles.container}>
        <Stack.Screen options={{ title: "Update Engine Hours" }} />
        <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>Vessel not found</Text>
      </View>
    );
  }

  return (
    <View style={formStyles.container}>
      <Stack.Screen
        options={{
          title: "Update Engine Hours",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={formStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={formStyles.scrollView}
          contentContainerStyle={[
            formStyles.scrollContent,
            { paddingBottom: insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 24 }}>{vessel.name}</Text>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Current Hours</Text>
            <Text style={{ fontSize: 32, fontWeight: "700", color: colors.text }}>{currentHours.toLocaleString()}</Text>
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>New Hours</Text>
            <TextInput
              style={[formStyles.input, focusedField === "newHours" && formStyles.inputFocused]}
              value={newHours}
              onChangeText={setNewHours}
              onFocus={() => setFocusedField("newHours")}
              onBlur={() => setFocusedField(null)}
              placeholder={`Must be ≥ ${currentHours}`}
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Notes</Text>
            <TextInput
              style={[formStyles.input, formStyles.textArea, focusedField === "notes" && formStyles.inputFocused]}
              value={notes}
              onChangeText={setNotes}
              onFocus={() => setFocusedField("notes")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g., Post-charter check, after sea trial..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
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
