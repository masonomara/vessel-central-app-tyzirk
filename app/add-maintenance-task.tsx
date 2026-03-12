import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { colors, formStyles } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { TaskPriority, MaintenanceFrequency } from "../types";
import { PRIORITY_OPTIONS, getPriorityColor } from "../utils/formatting";
import DateTimePicker from "@react-native-community/datetimepicker";
import { scrollProps } from "../hooks/useTopPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddMaintenanceTaskScreen() {
  const insets = useSafeAreaInsets();
  const { vessels, addMaintenanceTask } = useData();
  const { userId, userName, userRole } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vesselId, setVesselId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<MaintenanceFrequency>("monthly");
  const [frequencyValue, setFrequencyValue] = useState("1");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const frequencies: MaintenanceFrequency[] = [
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
  ];

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    vesselId.length > 0;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a task title");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Validation Error", "Please enter a task description");
      return false;
    }
    if (!vesselId) {
      Alert.alert("Validation Error", "Please select a vessel");
      return false;
    }
    if (isRecurring && !frequencyValue.trim()) {
      Alert.alert("Validation Error", "Please enter a frequency value");
      return false;
    }
    if (
      isRecurring &&
      (parseInt(frequencyValue) < 1 || isNaN(parseInt(frequencyValue)))
    ) {
      Alert.alert(
        "Validation Error",
        "Frequency value must be a positive number",
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const selectedVessel = vessels.find((v) => v.id === vesselId);
      if (!selectedVessel) {
        Alert.alert("Error", "Selected vessel not found");
        return;
      }

      const newTask = {
        title: title.trim(),
        description: description.trim(),
        vesselId,
        vesselName: selectedVessel.name,
        assignedTo: assignedTo || null,
        assignedToName: assignedToName || null,
        assignedToType: assignedTo ? ("crew" as const) : null,
        status: "open" as const,
        priority,
        dueDate,
        isRecurring,
        frequency: isRecurring ? frequency : undefined,
        frequencyValue: isRecurring ? parseInt(frequencyValue) : undefined,
        createdBy: userId || "unknown",
        attachments: [],
        comments: [],
        completionHistory: [],
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        category: "general",
        notes: notes.trim(),
      };

      addMaintenanceTask(newTask);
      Alert.alert("Success", "Maintenance task created successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error creating maintenance task:", error);
      Alert.alert("Error", "Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title || description || notes) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to discard this task?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={formStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: "New Maintenance Task",
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel}>
              <Text style={formStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={formStyles.scrollView}
        contentContainerStyle={formStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
        keyboardShouldPersistTaps="handled"
      >
        <View style={formStyles.section}>
          <Text style={formStyles.label}>Task Title *</Text>
          <TextInput
            style={[
              formStyles.input,
              focusedField === "title" && formStyles.inputFocused,
            ]}
            placeholder="e.g., Engine Service"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setFocusedField("title")}
            onBlur={() => setFocusedField(null)}
            maxLength={100}
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
            placeholder="Describe the maintenance task..."
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            onFocus={() => setFocusedField("description")}
            onBlur={() => setFocusedField(null)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Vessel *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={formStyles.optionsContainer}
          >
            {vessels.map((vessel) => (
              <TouchableOpacity
                key={vessel.id}
                style={[
                  formStyles.optionChip,
                  vesselId === vessel.id && formStyles.optionChipActive,
                ]}
                onPress={() => setVesselId(vessel.id)}
              >
                <Text
                  style={[
                    formStyles.optionChipText,
                    vesselId === vessel.id && formStyles.optionChipTextActive,
                  ]}
                >
                  {vessel.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Priority</Text>
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
                  priority === p && [formStyles.optionChipActive],
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    formStyles.optionChipText,
                    priority === p && formStyles.optionChipTextActive,
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Due Date</Text>
          <TouchableOpacity
            style={formStyles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={formStyles.dateButtonText}>
              {dueDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={formStyles.section}>
          <View style={formStyles.switchRow}>
            <Text style={formStyles.label}>Recurring Task</Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: colors.borderSoft, true: colors.text }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {isRecurring && (
          <>
            <View style={formStyles.section}>
              <Text style={formStyles.label}>Frequency</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={formStyles.optionsContainer}
              >
                {frequencies.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      formStyles.optionChip,
                      frequency === f && formStyles.optionChipActive,
                    ]}
                    onPress={() => setFrequency(f)}
                  >
                    <Text
                      style={[
                        formStyles.optionChipText,
                        frequency === f && formStyles.optionChipTextActive,
                      ]}
                    >
                      {f.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={formStyles.section}>
              <Text style={formStyles.label}>
                Every (number of {frequency}s)
              </Text>
              <TextInput
                style={[
                  formStyles.input,
                  focusedField === "frequencyValue" && formStyles.inputFocused,
                ]}
                placeholder="e.g., 3"
                placeholderTextColor={colors.textTertiary}
                value={frequencyValue}
                onChangeText={setFrequencyValue}
                onFocus={() => setFocusedField("frequencyValue")}
                onBlur={() => setFocusedField(null)}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </>
        )}

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Estimated Cost (Optional)</Text>
          <View style={formStyles.costInputContainer}>
            <Text style={formStyles.currencySymbol}>$</Text>
            <TextInput
              style={[
                formStyles.input,
                formStyles.costInput,
                focusedField === "estimatedCost" && formStyles.inputFocused,
              ]}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              value={estimatedCost}
              onChangeText={setEstimatedCost}
              onFocus={() => setFocusedField("estimatedCost")}
              onBlur={() => setFocusedField(null)}
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Assigned To (Optional)</Text>
          <TextInput
            style={[
              formStyles.input,
              focusedField === "assignedToName" && formStyles.inputFocused,
            ]}
            placeholder="Crew member name"
            placeholderTextColor={colors.textTertiary}
            value={assignedToName}
            onChangeText={(text) => {
              setAssignedToName(text);
              setAssignedTo(text ? "crew_temp_id" : "");
            }}
            onFocus={() => setFocusedField("assignedToName")}
            onBlur={() => setFocusedField(null)}
            maxLength={50}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Additional Notes (Optional)</Text>
          <TextInput
            style={[
              formStyles.input,
              formStyles.textArea,
              focusedField === "notes" && formStyles.inputFocused,
            ]}
            placeholder="Any additional information..."
            placeholderTextColor={colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            onFocus={() => setFocusedField("notes")}
            onBlur={() => setFocusedField(null)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />
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
            <Text style={formStyles.submitButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
