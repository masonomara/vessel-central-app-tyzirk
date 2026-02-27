import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, commonStyles, shadows } from "../styles/commonStyles";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { IconSymbol } from "../components/IconSymbol";
import { CalendarEventType } from "../types/calendar";
import { EVENT_TYPE_LABELS, getEventColor } from "../utils/calendarUtils";
import { scrollProps } from "../hooks/useTopPadding";

export default function AddCalendarEventScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, userName, userRole } = useAuth();
  const { vessels, getVesselsForUser, addCalendarEvent } = useData();

  const initialDate = params.date
    ? new Date(params.date as string)
    : new Date();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<CalendarEventType>("meeting");
  const [selectedVesselId, setSelectedVesselId] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(
    new Date(initialDate.getTime() + 60 * 60 * 1000),
  );
  const [allDay, setAllDay] = useState(false);
  const [notes, setNotes] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const userVessels = useMemo(() => {
    if (!userId || !userRole) return [];
    return getVesselsForUser(userId, userRole);
  }, [userId, userRole, vessels, getVesselsForUser]);

  if (userVessels.length === 0) {
    return (
      <View style={commonStyles.container}>
        <Stack.Screen options={{ title: "New Event" }} />
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

  const eventTypes: CalendarEventType[] = [
    "maintenance",
    "charter",
    "inspection",
    "crew_change",
    "provisioning",
    "meeting",
    "other",
  ];

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter an event title");
      return;
    }

    if (!selectedVesselId) {
      Alert.alert("Error", "Please select a vessel");
      return;
    }

    if (endDate <= startDate) {
      Alert.alert("Error", "End date must be after start date");
      return;
    }

    const selectedVessel = vessels.find((v) => v.id === selectedVesselId);
    if (!selectedVessel) {
      Alert.alert("Error", "Selected vessel not found");
      return;
    }

    addCalendarEvent({
      title: title.trim(),
      description: description.trim(),
      type: eventType,
      status: "scheduled",
      startDate,
      endDate,
      allDay,
      vesselId: selectedVesselId,
      vesselName: selectedVessel.name,
      location: location.trim(),
      attendees: [userId],
      attendeeNames: [userName],
      createdBy: userId,
      createdByName: userName,
      notes: notes.trim(),
      reminders: [
        { id: Date.now().toString(), minutes: 1440, method: "notification" },
      ],
      comments: [],
    });

    Alert.alert("Success", "Calendar event created successfully", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const newStartDate = new Date(startDate);
      newStartDate.setFullYear(selectedDate.getFullYear());
      newStartDate.setMonth(selectedDate.getMonth());
      newStartDate.setDate(selectedDate.getDate());
      setStartDate(newStartDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const newEndDate = new Date(endDate);
      newEndDate.setFullYear(selectedDate.getFullYear());
      newEndDate.setMonth(selectedDate.getMonth());
      newEndDate.setDate(selectedDate.getDate());
      setEndDate(newEndDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const newStartDate = new Date(startDate);
      newStartDate.setHours(selectedTime.getHours());
      newStartDate.setMinutes(selectedTime.getMinutes());
      setStartDate(newStartDate);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const newEndDate = new Date(endDate);
      newEndDate.setHours(selectedTime.getHours());
      newEndDate.setMinutes(selectedTime.getMinutes());
      setEndDate(newEndDate);
    }
  };

  return (
    <View style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: "New Event",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        {...scrollProps}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter event title"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Event Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Event Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typeScroll}
            >
              {eventTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    eventType === type && styles.typeChipSelected,
                    { borderColor: getEventColor(type) },
                  ]}
                  onPress={() => setEventType(type)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      eventType === type && { color: getEventColor(type) },
                    ]}
                  >
                    {EVENT_TYPE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Vessel */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Vessel *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.vesselScroll}
            >
              {userVessels.map((vessel) => (
                <TouchableOpacity
                  key={vessel.id}
                  style={[
                    styles.vesselChip,
                    selectedVesselId === vessel.id && styles.vesselChipSelected,
                  ]}
                  onPress={() => setSelectedVesselId(vessel.id)}
                >
                  <Text
                    style={[
                      styles.vesselChipText,
                      selectedVesselId === vessel.id &&
                        styles.vesselChipTextSelected,
                    ]}
                  >
                    {vessel.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* All Day Toggle */}
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>All Day Event</Text>
              <Switch
                value={allDay}
                onValueChange={setAllDay}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>
          </View>

          {/* Start Date/Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Start</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="event"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.dateTimeText}>
                  {startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {!allDay && (
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <IconSymbol
                    ios_icon_name="clock.fill"
                    android_material_icon_name="schedule"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.dateTimeText}>
                    {startDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* End Date/Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>End</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="event"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.dateTimeText}>
                  {endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {!allDay && (
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <IconSymbol
                    ios_icon_name="clock.fill"
                    android_material_icon_name="schedule"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.dateTimeText}>
                    {endDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter event description"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>

      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}
      {showStartTimePicker && (
        <DateTimePicker
          value={startDate}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
        />
      )}
      {showEndTimePicker && (
        <DateTimePicker
          value={endDate}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  cancelText: {
    fontSize: 16,
    color: colors.text,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  form: {
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.container,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  typeScroll: {
    marginTop: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceOne,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 8,
  },
  typeChipSelected: {
    backgroundColor: colors.surfaceOne,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  vesselScroll: {
    marginTop: 8,
  },
  vesselChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceOne,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  vesselChipSelected: {
    backgroundColor: colors.surfaceOne,
    borderColor: colors.text,
  },
  vesselChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  vesselChipTextSelected: {
    color: colors.text,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
});
