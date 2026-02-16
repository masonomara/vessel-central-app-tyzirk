
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { TaskPriority, MaintenanceFrequency } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddMaintenanceTaskScreen() {
  const theme = useTheme();
  const { vessels, addMaintenanceTask } = useData();
  const { userId, userName, userRole } = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<MaintenanceFrequency>('monthly');
  const [frequencyValue, setFrequencyValue] = useState('1');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [assignedToName, setAssignedToName] = useState('');

  // Dropdown states
  const [showVesselPicker, setShowVesselPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  const backgroundColor = theme.dark ? 'rgb(28, 28, 30)' : theme.colors.background;

  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
  const frequencies: MaintenanceFrequency[] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'urgent': return colors.danger;
      case 'high': return colors.warning;
      case 'medium': return colors.accent;
      case 'low': return colors.success;
      default: return colors.grey;
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a task title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a task description');
      return false;
    }
    if (!vesselId) {
      Alert.alert('Validation Error', 'Please select a vessel');
      return false;
    }
    if (isRecurring && !frequencyValue.trim()) {
      Alert.alert('Validation Error', 'Please enter a frequency value');
      return false;
    }
    if (isRecurring && (parseInt(frequencyValue) < 1 || isNaN(parseInt(frequencyValue)))) {
      Alert.alert('Validation Error', 'Frequency value must be a positive number');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const selectedVessel = vessels.find(v => v.id === vesselId);
    if (!selectedVessel) {
      Alert.alert('Error', 'Selected vessel not found');
      return;
    }

    const newTask = {
      title: title.trim(),
      description: description.trim(),
      vesselId,
      vesselName: selectedVessel.name,
      assignedTo: assignedTo || null,
      assignedToName: assignedToName || null,
      assignedToType: assignedTo ? ('crew' as const) : null,
      status: 'open' as const,
      priority,
      dueDate,
      isRecurring,
      frequency: isRecurring ? frequency : undefined,
      frequencyValue: isRecurring ? parseInt(frequencyValue) : undefined,
      createdBy: userId || 'unknown',
      attachments: [],
      completionHistory: [],
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      notes: notes.trim(),
    };

    addMaintenanceTask(newTask);
    Alert.alert('Success', 'Maintenance task created successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleCancel = () => {
    if (title || description || notes) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard this task?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Maintenance Task</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.headerButton}>
          <Text style={styles.saveText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Engine Service"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the maintenance task..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Vessel *</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowVesselPicker(!showVesselPicker)}
          >
            <Text style={[styles.pickerText, !vesselId && styles.pickerPlaceholder]}>
              {vesselId ? vessels.find(v => v.id === vesselId)?.name : 'Select a vessel'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="expand_more"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showVesselPicker && (
            <View style={styles.pickerOptions}>
              {vessels.map((vessel) => (
                <TouchableOpacity
                  key={vessel.id}
                  style={styles.pickerOption}
                  onPress={() => {
                    setVesselId(vessel.id);
                    setShowVesselPicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, vesselId === vessel.id && styles.pickerOptionSelected]}>
                    {vessel.name}
                  </Text>
                  {vesselId === vessel.id && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={20}
                      color={colors.accent}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowPriorityPicker(!showPriorityPicker)}
          >
            <View style={styles.priorityContainer}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(priority) }]} />
              <Text style={styles.pickerText}>{priority.toUpperCase()}</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="expand_more"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showPriorityPicker && (
            <View style={styles.pickerOptions}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.pickerOption}
                  onPress={() => {
                    setPriority(p);
                    setShowPriorityPicker(false);
                  }}
                >
                  <View style={styles.priorityContainer}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(p) }]} />
                    <Text style={[styles.pickerOptionText, priority === p && styles.pickerOptionSelected]}>
                      {p.toUpperCase()}
                    </Text>
                  </View>
                  {priority === p && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={20}
                      color={colors.accent}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateContainer}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="event"
                size={20}
                color={colors.accent}
              />
              <Text style={styles.pickerText}>
                {dueDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="expand_more"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="repeat"
                size={20}
                color={colors.accent}
              />
              <Text style={styles.label}>Recurring Task</Text>
            </View>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: colors.border, true: colors.accent + '80' }}
              thumbColor={isRecurring ? colors.accent : colors.textSecondary}
            />
          </View>
        </View>

        {isRecurring && (
          <React.Fragment>
            <View style={styles.section}>
              <Text style={styles.label}>Frequency</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
              >
                <Text style={styles.pickerText}>{frequency.toUpperCase()}</Text>
                <IconSymbol
                  ios_icon_name="chevron.down"
                  android_material_icon_name="expand_more"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {showFrequencyPicker && (
                <View style={styles.pickerOptions}>
                  {frequencies.map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={styles.pickerOption}
                      onPress={() => {
                        setFrequency(f);
                        setShowFrequencyPicker(false);
                      }}
                    >
                      <Text style={[styles.pickerOptionText, frequency === f && styles.pickerOptionSelected]}>
                        {f.toUpperCase()}
                      </Text>
                      {frequency === f && (
                        <IconSymbol
                          ios_icon_name="checkmark"
                          android_material_icon_name="check"
                          size={20}
                          color={colors.accent}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Every (number of {frequency}s)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3"
                placeholderTextColor={colors.textSecondary}
                value={frequencyValue}
                onChangeText={setFrequencyValue}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </React.Fragment>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Estimated Cost (Optional)</Text>
          <View style={styles.costInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.costInput]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={estimatedCost}
              onChangeText={setEstimatedCost}
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Assigned To (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Crew member name"
            placeholderTextColor={colors.textSecondary}
            value={assignedToName}
            onChangeText={(text) => {
              setAssignedToName(text);
              setAssignedTo(text ? 'crew_temp_id' : '');
            }}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Additional Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional information..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'right',
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  picker: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerPlaceholder: {
    color: colors.textSecondary,
  },
  pickerOptions: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerOptionSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  costInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 4,
  },
  costInput: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 0,
  },
  bottomPadding: {
    height: 40,
  },
});
