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
import { EquipmentCategory, EquipmentCondition } from "../types";
import { scrollProps } from "../hooks/useTopPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EQUIPMENT_CATEGORIES: { label: string; value: EquipmentCategory }[] = [
  { label: "Safety", value: "safety" },
  { label: "Water Toys", value: "water_toys" },
  { label: "Navigation", value: "navigation" },
  { label: "Communication", value: "communication" },
  { label: "Anchoring", value: "anchoring" },
  { label: "Tender", value: "tender" },
  { label: "Galley", value: "galley" },
  { label: "Other", value: "other" },
];

const CONDITION_OPTIONS: { label: string; value: EquipmentCondition }[] = [
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
  { label: "Needs Replacement", value: "needs_replacement" },
];

export default function AddEquipmentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addEquipment, vessels, getVesselsForUser } = useData();
  const { userId, userName, userRole } = useAuth();

  const userVessels = getVesselsForUser(userId, userRole || "crew");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EquipmentCategory>("safety");
  const [selectedVesselId, setSelectedVesselId] = useState(
    userVessels[0]?.id || "",
  );
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState<EquipmentCondition>("good");
  const [serialNumber, setSerialNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [lastInspectionDate, setLastInspectionDate] = useState<Date | null>(
    null,
  );
  const [showLastInspectionPicker, setShowLastInspectionPicker] =
    useState(false);
  const [nextInspectionDate, setNextInspectionDate] = useState<Date | null>(
    null,
  );
  const [showNextInspectionPicker, setShowNextInspectionPicker] =
    useState(false);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVessel = vessels.find((v) => v.id === selectedVesselId);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter an equipment name.");
      return false;
    }
    if (!selectedVesselId) {
      Alert.alert("Validation Error", "Please select a vessel.");
      return false;
    }
    if (!quantity.trim() || isNaN(Number(quantity))) {
      Alert.alert("Validation Error", "Please enter a valid quantity.");
      return false;
    }
    if (!location.trim()) {
      Alert.alert("Validation Error", "Please enter a location.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      addEquipment({
        name: name.trim(),
        description: description.trim(),
        category,
        vesselId: selectedVesselId,
        vesselName: selectedVessel?.name || "",
        quantity: parseInt(quantity, 10),
        condition,
        serialNumber: serialNumber.trim() || undefined,
        manufacturer: manufacturer.trim() || undefined,
        model: model.trim() || undefined,
        purchaseDate: purchaseDate || undefined,
        lastInspectionDate: lastInspectionDate || undefined,
        nextInspectionDate: nextInspectionDate || undefined,
        location: location.trim(),
        notes: notes.trim(),
        createdBy: userId,
        createdByName: userName,
        comments: [],
      });

      Alert.alert("Success", "Equipment added successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error submitting equipment:", error);
      Alert.alert("Error", "Failed to add equipment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDatePicker = (
    label: string,
    value: Date | null,
    onChange: (date: Date | null) => void,
    showPicker: boolean,
    setShowPicker: (show: boolean) => void,
  ) => (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {Platform.OS === "ios" ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display="default"
            onChange={(_, date) => {
              if (date) onChange(date);
            }}
            style={styles.datePicker}
          />
          {value && (
            <TouchableOpacity onPress={() => onChange(null)}>
              <Text style={{ color: colors.danger, fontSize: 14 }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPicker(true)}
          >
            <Text style={{ color: value ? colors.text : colors.textSecondary }}>
              {value ? value.toLocaleDateString() : "Select date (optional)"}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={value || new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowPicker(false);
                if (date) onChange(date);
              }}
            />
          )}
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen
        options={{
          title: "Add Equipment",
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
          <Text style={styles.label}>Equipment Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Life Jackets"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Equipment description..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.optionChip,
                  category === cat.value && styles.optionChipActive,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    category === cat.value && styles.optionChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor={colors.textSecondary}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Condition *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {CONDITION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  condition === opt.value && styles.optionChipActive,
                ]}
                onPress={() => setCondition(opt.value)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    condition === opt.value && styles.optionChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Serial Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Serial number (optional)"
            placeholderTextColor={colors.textSecondary}
            value={serialNumber}
            onChangeText={setSerialNumber}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Manufacturer</Text>
          <TextInput
            style={styles.input}
            placeholder="Manufacturer (optional)"
            placeholderTextColor={colors.textSecondary}
            value={manufacturer}
            onChangeText={setManufacturer}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            placeholder="Model (optional)"
            placeholderTextColor={colors.textSecondary}
            value={model}
            onChangeText={setModel}
          />
        </View>

        {renderDatePicker(
          "Purchase Date",
          purchaseDate,
          setPurchaseDate,
          showPurchaseDatePicker,
          setShowPurchaseDatePicker,
        )}

        {renderDatePicker(
          "Last Inspection Date",
          lastInspectionDate,
          setLastInspectionDate,
          showLastInspectionPicker,
          setShowLastInspectionPicker,
        )}

        {renderDatePicker(
          "Next Inspection Date",
          nextInspectionDate,
          setNextInspectionDate,
          showNextInspectionPicker,
          setShowNextInspectionPicker,
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Forward Locker, Bridge"
            placeholderTextColor={colors.textSecondary}
            value={location}
            onChangeText={setLocation}
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
            {isSubmitting ? "Saving..." : "Add Equipment"}
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
