import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Animated,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/commonStyles";
import { IconSymbol } from "../components/IconSymbol";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "owner" | "manager" | "crew";
}

const MOCK_USERS: MockUser[] = [
  {
    id: "owner1",
    name: "John Smith",
    email: "john@vesselco.com",
    password: "owner123",
    role: "owner",
  },
  {
    id: "owner2",
    name: "Emily Brown",
    email: "emily@vesselco.com",
    password: "owner123",
    role: "owner",
  },
  {
    id: "manager1",
    name: "Sarah Johnson",
    email: "sarah@vesselco.com",
    password: "manager123",
    role: "manager",
  },
  {
    id: "manager2",
    name: "Tom Wilson",
    email: "tom@vesselco.com",
    password: "manager123",
    role: "manager",
  },
  {
    id: "crew1",
    name: "Mike Davis",
    email: "mike@vesselco.com",
    password: "crew123",
    role: "crew",
  },
  {
    id: "crew3",
    name: "Jane Smith",
    email: "jane@vesselco.com",
    password: "crew123",
    role: "crew",
  },
];

export default function LoginScreen() {
  const router = useRouter();
  const { setUserRole, setUserName, setUserId } = useAuth();

  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(30)).current;

  const handleMockLogin = async (user: MockUser) => {
    setUserRole(user.role);
    setUserName(user.name);
    setUserId(user.id);

    await AsyncStorage.setItem("authToken", "demo-token-" + user.id);
    await AsyncStorage.setItem("userId", user.id);
    await AsyncStorage.setItem("userRole", user.role);
    await AsyncStorage.setItem("userName", user.name);

    setIsLoading(false);
    router.replace(`/(tabs)/${user.role}`);
  };

  const handleQuickLogin = async (role: "owner" | "manager" | "crew") => {
    const user = MOCK_USERS.find((u) => u.role === role);
    if (user) {
      setIsLoading(true);
      setTimeout(async () => {
        await handleMockLogin(user);
      }, 400);
    }
  };

  const handleEmailLogin = async () => {
    setError("");
    Keyboard.dismiss();

    if (!email.trim() || !password.trim()) {
      setError("Email and password required");
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const user = MOCK_USERS.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );

      if (user) {
        await handleMockLogin(user);
      } else {
        setIsLoading(false);
        setError("Invalid email or password");
      }
    }, 800);
  };

  const toggleEmailLogin = () => {
    if (showEmailLogin) {
      Keyboard.dismiss();
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslate, {
          toValue: 30,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowEmailLogin(false);
        setEmail("");
        setPassword("");
        setError("");
      });
    } else {
      setShowEmailLogin(true);
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return (
    <LinearGradient
      colors={["#0A2540", "#122D4D", "#1E3A5F"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Center brand */}
        <View style={styles.brandSection}>
          <IconSymbol
            ios_icon_name="sailboat.fill"
            android_material_icon_name="sailing"
            size={56}
            color={colors.gold}
          />
          <Text style={styles.brandName}>Vessel & Co.</Text>
          <Text style={styles.brandTagline}>Yacht Management</Text>
        </View>

        {/* Bottom actions */}
        <View style={styles.bottomSection}>
          {/* Email login form */}
          {showEmailLogin && (
            <Animated.View
              style={[
                styles.formSection,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslate }],
                },
              ]}
            >
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <IconSymbol
                    ios_icon_name={showPassword ? "eye.slash.fill" : "eye.fill"}
                    android_material_icon_name={
                      showPassword ? "visibility-off" : "visibility"
                    }
                    size={18}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleEmailLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#0A2540" size="small" />
                ) : (
                  <Text style={styles.signInButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Email toggle */}
          <TouchableOpacity
            style={styles.emailButton}
            onPress={toggleEmailLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name={showEmailLogin ? "chevron.down" : "envelope.fill"}
              android_material_icon_name={
                showEmailLogin ? "expand-more" : "email"
              }
              size={18}
              color="#fff"
            />
            <Text style={styles.emailButtonText}>
              {showEmailLogin ? "Cancel" : "Sign in with email"}
            </Text>
          </TouchableOpacity>

          {/* Demo section */}
          {!showEmailLogin && (
            <View style={styles.demoSection}>
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Quick Demo</Text>
                <View style={styles.divider} />
              </View>
              <View style={styles.demoButtonRow}>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={() => handleQuickLogin("owner")}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="crown.fill"
                    android_material_icon_name="workspace-premium"
                    size={20}
                    color={colors.gold}
                  />
                  <Text style={styles.demoButtonText}>Owner</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={() => handleQuickLogin("manager")}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="chart.bar.fill"
                    android_material_icon_name="dashboard"
                    size={20}
                    color={colors.accent}
                  />
                  <Text style={styles.demoButtonText}>Manager</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={() => handleQuickLogin("crew")}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="person.2.fill"
                    android_material_icon_name="groups"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.demoButtonText}>Crew</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "space-between",
  },
  brandSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  brandName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 16,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    marginTop: 6,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 50 : 32,
  },
  formSection: {
    marginBottom: 16,
    gap: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FF6B6B",
    textAlign: "center",
  },
  signInButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A2540",
    letterSpacing: 0.3,
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  demoSection: {
    marginTop: 24,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  demoButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  demoButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,37,64,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
