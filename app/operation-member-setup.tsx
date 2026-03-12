import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, formStyles } from "../styles/commonStyles";
import { scrollProps } from "../hooks/useTopPadding";
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    <View style={formStyles.container}>
      <Stack.Screen
        options={{
          title: "Create an Account",
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
          keyboardShouldPersistTaps="handled"
          {...scrollProps}
        >
          {/* Name row */}
          <View style={[formStyles.row, formStyles.section]}>
            <View style={formStyles.flex1}>
              <Text style={formStyles.label}>First Name</Text>
              <TextInput
                style={[formStyles.input, focusedField === "firstName" && formStyles.inputFocused]}
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setFocusedField("firstName")}
                onBlur={() => setFocusedField(null)}
                placeholder="John"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            <View style={formStyles.flex1}>
              <Text style={formStyles.label}>Last Name</Text>
              <TextInput
                style={[formStyles.input, focusedField === "lastName" && formStyles.inputFocused]}
                value={lastName}
                onChangeText={setLastName}
                onFocus={() => setFocusedField("lastName")}
                onBlur={() => setFocusedField(null)}
                placeholder="Smith"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Email */}
          <View style={formStyles.section}>
            <Text style={formStyles.label}>Email</Text>
            <TextInput
              style={[formStyles.input, focusedField === "email" && formStyles.inputFocused]}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="john@example.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Phone */}
          <View style={formStyles.section}>
            <Text style={formStyles.label}>Phone</Text>
            <TextInput
              style={[formStyles.input, focusedField === "phone" && formStyles.inputFocused]}
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              placeholder="+1 (340) 555-0100"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
            />
          </View>

          {/* Position */}
          <View style={formStyles.section}>
            <Text style={formStyles.label}>Position / Title</Text>
            <TextInput
              style={[formStyles.input, focusedField === "position" && formStyles.inputFocused]}
              value={position}
              onChangeText={setPosition}
              onFocus={() => setFocusedField("position")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Captain, Chief Engineer"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          {/* Role selector */}
          <View style={formStyles.section}>
            <Text style={formStyles.label}>Role</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {ROLES.map((role) => {
                const active = selectedRole === role.value;
                return (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      {
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        paddingVertical: 12,
                        gap: 8,
                        borderWidth: 1,
                        borderColor: colors.borderSoft,
                      },
                      active && {
                        backgroundColor: colors.surfaceThree,
                        borderColor: colors.surfaceThree,
                      },
                    ]}
                    onPress={() => setSelectedRole(role.value)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      ios_icon_name={role.icon}
                      android_material_icon_name={role.androidIcon}
                      size={20}
                      color={active ? colors.text : colors.textTertiary}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: active ? "600" : "500",
                        color: active ? colors.text : colors.textSecondary,
                      }}
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
        <View style={[formStyles.bottomBar, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={[formStyles.submitButton, !canSubmit && formStyles.submitButtonDisabled]}
            onPress={handleComplete}
            disabled={!canSubmit || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={formStyles.submitButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
