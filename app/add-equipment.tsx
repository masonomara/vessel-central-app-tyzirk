import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, formStyles } from "../styles/commonStyles";
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
    <View style={formStyles.section}>
      <Text style={formStyles.label}>{label}</Text>
      <TouchableOpacity
        style={formStyles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text
          style={[
            formStyles.dateButtonText,
            !value && { color: colors.textTertiary },
          ]}
        >
          {value ? value.toLocaleDateString() : "Select date (optional)"}
        </Text>
      </TouchableOpacity>
      {value && (
        <TouchableOpacity onPress={() => onChange(null)}>
          <Text style={{ color: colors.danger, fontSize: 14, marginTop: 6 }}>
            Clear
          </Text>
        </TouchableOpacity>
      )}
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
    </View>
  );

  return (
    <View style={formStyles.container}>
      <Stack.Screen
        options={{
          title: "Add Equipment",
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
          <Text style={formStyles.label}>Equipment Name *</Text>
          <TextInput
            style={formStyles.input}
            placeholder="e.g., Life Jackets"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Description</Text>
          <TextInput
            style={[formStyles.input, formStyles.textArea]}
            placeholder="Equipment description..."
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={formStyles.optionsContainer}
          >
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  formStyles.optionChip,
                  category === cat.value && formStyles.optionChipActive,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text
                  style={[
                    formStyles.optionChipText,
                    category === cat.value && formStyles.optionChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
          <Text style={formStyles.label}>Quantity *</Text>
          <TextInput
            style={formStyles.input}
            placeholder="1"
            placeholderTextColor={colors.textTertiary}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Condition *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={formStyles.optionsContainer}
          >
            {CONDITION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  formStyles.optionChip,
                  condition === opt.value && formStyles.optionChipActive,
                ]}
                onPress={() => setCondition(opt.value)}
              >
                <Text
                  style={[
                    formStyles.optionChipText,
                    condition === opt.value && formStyles.optionChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Serial Number</Text>
          <TextInput
            style={formStyles.input}
            placeholder="Serial number (optional)"
            placeholderTextColor={colors.textTertiary}
            value={serialNumber}
            onChangeText={setSerialNumber}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Manufacturer</Text>
          <TextInput
            style={formStyles.input}
            placeholder="Manufacturer (optional)"
            placeholderTextColor={colors.textTertiary}
            value={manufacturer}
            onChangeText={setManufacturer}
          />
        </View>

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Model</Text>
          <TextInput
            style={formStyles.input}
            placeholder="Model (optional)"
            placeholderTextColor={colors.textTertiary}
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

        <View style={formStyles.section}>
          <Text style={formStyles.label}>Location *</Text>
          <TextInput
            style={formStyles.input}
            placeholder="e.g., Forward Locker, Bridge"
            placeholderTextColor={colors.textTertiary}
            value={location}
            onChangeText={setLocation}
          />
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
