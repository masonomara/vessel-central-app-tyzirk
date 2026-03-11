import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scrollProps } from "../hooks/useTopPadding";
import { TouchableOpacity } from "react-native";

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

  const handleSubmit = () => {
    const hours = parseInt(newHours, 10);
    if (isNaN(hours) || hours < currentHours) {
      Alert.alert("Invalid Hours", `Engine hours must be at least ${currentHours}.`);
      return;
    }
    if (!userId || !userName || !userRole) return;
    updateEngineHours(vesselId as string, hours, userId, userName, userRole, notes);
    Alert.alert("Updated", "Engine hours have been updated.", [{ text: "OK", onPress: () => router.back() }]);
  };

  if (!vessel) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Update Engine Hours" }} />
        <Text style={styles.errorText}>Vessel not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 64 },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <Stack.Screen
          options={{
            title: "Update Engine Hours",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ color: colors.textSecondary, fontSize: 17 }}>Cancel</Text>
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity onPress={handleSubmit}>
                <Text style={{ color: colors.accent, fontSize: 17, fontWeight: "600" }}>Save</Text>
              </TouchableOpacity>
            ),
          }}
        />

        <Text style={styles.vesselName}>{vessel.name}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Current Hours</Text>
          <Text style={styles.currentValue}>{currentHours.toLocaleString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>New Hours</Text>
          <TextInput
            style={styles.input}
            value={newHours}
            onChangeText={setNewHours}
            placeholder={`Must be ≥ ${currentHours}`}
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Post-charter check, after sea trial..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceOne,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  vesselName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  currentValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
  },
  input: {
    backgroundColor: colors.container,
    borderWidth: 1,
    borderColor: colors.surfaceThree,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
});
