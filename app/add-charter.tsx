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
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, formStyles } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { scrollProps } from "../hooks/useTopPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddCharterScreen() {
  const insets = useSafeAreaInsets();
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const selectedVessel = vessels.find((v) => v.id === selectedVesselId);

  const canSubmit =
    title.trim().length > 0 &&
    selectedVesselId.length > 0 &&
    guestCount.trim().length > 0 &&
    !isNaN(Number(guestCount));

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
    <View style={formStyles.container}>
      <Stack.Screen
        options={{
          title: "Add Charter",
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
            <Text style={formStyles.label}>Charter Title *</Text>
            <TextInput
              style={[formStyles.input, focusedField === "title" && formStyles.inputFocused]}
              placeholder="e.g., Mediterranean Summer Charter"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              maxLength={100}
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
            <Text style={formStyles.label}>Start Date *</Text>
            <TouchableOpacity
              style={formStyles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={formStyles.dateButtonText}>
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
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>End Date *</Text>
            <TouchableOpacity
              style={formStyles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={formStyles.dateButtonText}>
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
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Guest Count *</Text>
            <TextInput
              style={[formStyles.input, focusedField === "guestCount" && formStyles.inputFocused]}
              placeholder="Number of guests"
              placeholderTextColor={colors.textTertiary}
              value={guestCount}
              onChangeText={setGuestCount}
              onFocus={() => setFocusedField("guestCount")}
              onBlur={() => setFocusedField(null)}
              keyboardType="numeric"
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Guest Names</Text>
            <TextInput
              style={[formStyles.input, focusedField === "guestNames" && formStyles.inputFocused]}
              placeholder="Guest names (optional)"
              placeholderTextColor={colors.textTertiary}
              value={guestNames}
              onChangeText={setGuestNames}
              onFocus={() => setFocusedField("guestNames")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Departure Port</Text>
            <TextInput
              style={[formStyles.input, focusedField === "departurePort" && formStyles.inputFocused]}
              placeholder="e.g., Port de Monaco"
              placeholderTextColor={colors.textTertiary}
              value={departurePort}
              onChangeText={setDeparturePort}
              onFocus={() => setFocusedField("departurePort")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Arrival Port</Text>
            <TextInput
              style={[formStyles.input, focusedField === "arrivalPort" && formStyles.inputFocused]}
              placeholder="e.g., Port de Saint-Tropez"
              placeholderTextColor={colors.textTertiary}
              value={arrivalPort}
              onChangeText={setArrivalPort}
              onFocus={() => setFocusedField("arrivalPort")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Itinerary</Text>
            <TextInput
              style={[formStyles.input, formStyles.textArea, focusedField === "itinerary" && formStyles.inputFocused]}
              placeholder="Charter itinerary details..."
              placeholderTextColor={colors.textTertiary}
              value={itinerary}
              onChangeText={setItinerary}
              onFocus={() => setFocusedField("itinerary")}
              onBlur={() => setFocusedField(null)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Revenue</Text>
            <View style={formStyles.costInputContainer}>
              <Text style={formStyles.currencySymbol}>$</Text>
              <TextInput
                style={[formStyles.input, formStyles.costInput, focusedField === "revenue" && formStyles.inputFocused]}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                value={revenue}
                onChangeText={setRevenue}
                onFocus={() => setFocusedField("revenue")}
                onBlur={() => setFocusedField(null)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Expenses</Text>
            <View style={formStyles.costInputContainer}>
              <Text style={formStyles.currencySymbol}>$</Text>
              <TextInput
                style={[formStyles.input, formStyles.costInput, focusedField === "expenses" && formStyles.inputFocused]}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                value={expenses}
                onChangeText={setExpenses}
                onFocus={() => setFocusedField("expenses")}
                onBlur={() => setFocusedField(null)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Broker Name</Text>
            <TextInput
              style={[formStyles.input, focusedField === "brokerName" && formStyles.inputFocused]}
              placeholder="Broker name (optional)"
              placeholderTextColor={colors.textTertiary}
              value={brokerName}
              onChangeText={setBrokerName}
              onFocus={() => setFocusedField("brokerName")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Broker Commission</Text>
            <View style={formStyles.costInputContainer}>
              <Text style={formStyles.currencySymbol}>$</Text>
              <TextInput
                style={[formStyles.input, formStyles.costInput, focusedField === "brokerCommission" && formStyles.inputFocused]}
                placeholder="0.00 (optional)"
                placeholderTextColor={colors.textTertiary}
                value={brokerCommission}
                onChangeText={setBrokerCommission}
                onFocus={() => setFocusedField("brokerCommission")}
                onBlur={() => setFocusedField(null)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={formStyles.section}>
            <Text style={formStyles.label}>Special Requests</Text>
            <TextInput
              style={[formStyles.input, formStyles.textArea, focusedField === "specialRequests" && formStyles.inputFocused]}
              placeholder="Any special requests from guests..."
              placeholderTextColor={colors.textTertiary}
              value={specialRequests}
              onChangeText={setSpecialRequests}
              onFocus={() => setFocusedField("specialRequests")}
              onBlur={() => setFocusedField(null)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
