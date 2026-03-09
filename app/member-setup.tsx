import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../styles/commonStyles";
import { IconSymbol } from "../components/IconSymbol";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Role = "owner" | "manager" | "crew";

const ROLES: { value: Role; label: string; icon: string; androidIcon: string; color: string }[] = [
  { value: "owner", label: "Owner", icon: "crown.fill", androidIcon: "workspace-premium", color: colors.gold },
  { value: "manager", label: "Manager", icon: "chart.bar.fill", androidIcon: "dashboard", color: colors.accent },
  { value: "crew", label: "Crew", icon: "person.2.fill", androidIcon: "groups", color: colors.success },
];

export default function MemberSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string }>();
  const { setUserRole, setUserName, setUserId } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(params.email || "");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = firstName.trim() && lastName.trim() && selectedRole;

  const handleComplete = async () => {
    if (!canSubmit || !selectedRole) return;

    setIsLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const userId = `${selectedRole}-${Date.now()}`;

    await setUserRole(selectedRole);
    await setUserName(fullName);
    await setUserId(userId);
    await AsyncStorage.setItem("authToken", `demo-token-${userId}`);
    await AsyncStorage.setItem("userId", userId);
    await AsyncStorage.setItem("userRole", selectedRole);
    await AsyncStorage.setItem("userName", fullName);

    router.replace(`/(tabs)/${selectedRole}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Member Details</Text>
          <Text style={styles.subtitle}>Tell us about yourself to get started.</Text>

          {/* Name row */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Smith"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
            />
          </View>

          {/* Position */}
          <View style={styles.field}>
            <Text style={styles.label}>Position / Title</Text>
            <TextInput
              style={styles.input}
              value={position}
              onChangeText={setPosition}
              placeholder="e.g. Captain, Chief Engineer"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          {/* Role selector */}
          <View style={styles.field}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleRow}>
              {ROLES.map((role) => {
                const active = selectedRole === role.value;
                return (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.roleOption,
                      active && { borderColor: role.color, backgroundColor: `${role.color}12` },
                    ]}
                    onPress={() => setSelectedRole(role.value)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      ios_icon_name={role.icon}
                      android_material_icon_name={role.androidIcon}
                      size={22}
                      color={active ? role.color : colors.textTertiary}
                    />
                    <Text
                      style={[
                        styles.roleLabel,
                        active && { color: role.color, fontWeight: "600" },
                      ]}
                    >
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Bottom button */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleComplete}
            disabled={!canSubmit || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceOne,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  field: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.container,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  roleRow: {
    flexDirection: "row",
    gap: 10,
  },
  roleOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.container,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.surfaceOne,
  },
  submitButton: {
    backgroundColor: colors.text,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
