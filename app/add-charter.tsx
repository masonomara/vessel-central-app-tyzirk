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

export default function AddCharterScreen() {
  const router = useRouter();
  const { addCharterLog, vessels, getVesselsForUser } = useData();
  const { userId, userName, userRole } = useAuth();

  const userVessels = getVesselsForUser(userId, userRole || "crew");

  const [title, setTitle] = useState("");
  const [selectedVesselId, setSelectedVesselId] = useState(
    userVessels[0]?.id || "",
  );
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [guestCount, setGuestCount] = useState("");
  const [guestNames, setGuestNames] = useState("");
  const [departurePort, setDeparturePort] = useState("");
  const [arrivalPort, setArrivalPort] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [revenue, setRevenue] = useState("");
  const [expenses, setExpenses] = useState("");
  const [brokerName, setBrokerName] = useState("");
  const [brokerCommission, setBrokerCommission] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVessel = vessels.find((v) => v.id === selectedVesselId);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a charter title.");
      return false;
    }
    if (!selectedVesselId) {
      Alert.alert("Validation Error", "Please select a vessel.");
      return false;
    }
    if (!guestCount.trim() || isNaN(Number(guestCount))) {
      Alert.alert("Validation Error", "Please enter a valid guest count.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      addCharterLog({
        title: title.trim(),
        vesselId: selectedVesselId,
        vesselName: selectedVessel?.name || "",
        startDate,
        endDate,
        status: "upcoming",
        guestCount: parseInt(guestCount, 10),
        guestNames: guestNames.trim() || undefined,
        departurePort: departurePort.trim(),
        arrivalPort: arrivalPort.trim(),
        itinerary: itinerary.trim(),
        revenue: parseFloat(revenue) || 0,
        expenses: parseFloat(expenses) || 0,
        brokerName: brokerName.trim() || undefined,
        brokerCommission: brokerCommission.trim()
          ? parseFloat(brokerCommission)
          : undefined,
        specialRequests: specialRequests.trim() || undefined,
        notes: notes.trim(),
        createdBy: userId,
        createdByName: userName,
        comments: [],
      });

      Alert.alert("Success", "Charter added successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error submitting charter:", error);
      Alert.alert("Error", "Failed to add charter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen
        options={{
          title: "Add Charter",
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
        contentContainerStyle={styles.scrollContent}
        {...scrollProps}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Charter Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Mediterranean Summer Charter"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
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
          <Text style={styles.label}>Start Date *</Text>
          {Platform.OS === "ios" ? (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(_, date) => {
                if (date) setStartDate(date);
              }}
              style={styles.datePicker}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={{ color: colors.text }}>
                  {startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowStartDatePicker(false);
                    if (date) setStartDate(date);
                  }}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>End Date *</Text>
          {Platform.OS === "ios" ? (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(_, date) => {
                if (date) setEndDate(date);
              }}
              style={styles.datePicker}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={{ color: colors.text }}>
                  {endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowEndDatePicker(false);
                    if (date) setEndDate(date);
                  }}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Guest Count *</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of guests"
            placeholderTextColor={colors.textSecondary}
            value={guestCount}
            onChangeText={setGuestCount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Guest Names</Text>
          <TextInput
            style={styles.input}
            placeholder="Guest names (optional)"
            placeholderTextColor={colors.textSecondary}
            value={guestNames}
            onChangeText={setGuestNames}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Departure Port</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Port de Monaco"
            placeholderTextColor={colors.textSecondary}
            value={departurePort}
            onChangeText={setDeparturePort}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Arrival Port</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Port de Saint-Tropez"
            placeholderTextColor={colors.textSecondary}
            value={arrivalPort}
            onChangeText={setArrivalPort}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Itinerary</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Charter itinerary details..."
            placeholderTextColor={colors.textSecondary}
            value={itinerary}
            onChangeText={setItinerary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Revenue</Text>
          <View style={styles.currencyInputRow}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={revenue}
              onChangeText={setRevenue}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Expenses</Text>
          <View style={styles.currencyInputRow}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={expenses}
              onChangeText={setExpenses}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Broker Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Broker name (optional)"
            placeholderTextColor={colors.textSecondary}
            value={brokerName}
            onChangeText={setBrokerName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Broker Commission</Text>
          <View style={styles.currencyInputRow}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="0.00 (optional)"
              placeholderTextColor={colors.textSecondary}
              value={brokerCommission}
              onChangeText={setBrokerCommission}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Special Requests</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special requests from guests..."
            placeholderTextColor={colors.textSecondary}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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
            {isSubmitting ? "Saving..." : "Add Charter"}
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
  datePicker: {
    alignSelf: "flex-start",
  },
  currencyInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "600",
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
    color: colors.text,
  },
});
