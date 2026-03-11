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
  ImageBackground,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, buttonStyles } from "../styles/commonStyles";
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
    name: "Diane Sanderson",
    email: "diane@vesselco.com",
    password: "owner123",
    role: "owner",
  },
  {
    id: "manager1",
    name: "Brett Nealson",
    email: "brett@vesselco.com",
    password: "manager123",
    role: "manager",
  },
  {
    id: "crew1",
    name: "Marcus Rivera",
    email: "marcus@vesselco.com",
    password: "crew123",
    role: "crew",
  },
  {
    id: "crew2",
    name: "Tanya Brooks",
    email: "tanya@vesselco.com",
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
  const formTranslate = useRef(new Animated.Value(20)).current;
  const demoOpacity = useRef(new Animated.Value(1)).current;

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

  const handleEmailLogin = () => {
    setError("");
    Keyboard.dismiss();

    if (!email.trim() || !password.trim()) {
      setError("Email and password required");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: "/operation-member-setup",
        params: { email: email.trim() },
      });
    }, 400);
  };

  const showForm = () => {
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
      Animated.timing(demoOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideForm = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslate, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(demoOpacity, {
        toValue: 1,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowEmailLogin(false);
      setEmail("");
      setPassword("");
      setError("");
    });
  };

  return (
    <ImageBackground
      source={require("../assets/login.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.85)"]}
        locations={[0, 0.4, 1]}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Center brand */}
          <View style={styles.brandSection}>
            <Image
              source={require("../assets/login.png")}
              style={styles.wordmark}
              resizeMode="contain"
            />
          </View>

          {/* Bottom actions */}
          <View style={styles.bottomSection}>
            {/* Email login form — slides in above Sign In */}
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
                      ios_icon_name={
                        showPassword ? "eye.slash.fill" : "eye.fill"
                      }
                      android_material_icon_name={
                        showPassword ? "visibility-off" : "visibility"
                      }
                      size={18}
                      color="rgba(255,255,255,0.5)"
                    />
                  </TouchableOpacity>
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </Animated.View>
            )}

            {/* Sign In — always visible, opens form or submits */}
            <TouchableOpacity
              style={buttonStyles.primaryButtonInverted}
              onPress={showEmailLogin ? handleEmailLogin : showForm}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#0A1628" size="small" />
              ) : (
                <Text style={buttonStyles.primaryButtonInvertedText}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Cancel — only when form is open */}
            {showEmailLogin && (
              <Animated.View style={{ opacity: formOpacity, marginTop: 12 }}>
                <TouchableOpacity
                  style={buttonStyles.outlineButtonInverted}
                  onPress={hideForm}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={buttonStyles.outlineButtonInvertedText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Demo section — crossfades with form */}
            <Animated.View
              style={[styles.quickLoginSection, { opacity: demoOpacity }]}
              pointerEvents={showEmailLogin ? "none" : "auto"}
            >
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>APP DEMOS</Text>
                <View style={styles.divider} />
              </View>
              <View style={styles.quickLoginButtonRow}>
                <TouchableOpacity
                  style={styles.quickLoginButton}
                  onPress={() => handleQuickLogin("owner")}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="crown.fill"
                    android_material_icon_name="workspace-premium"
                    size={20}
                    color={colors.container}
                  />
                  <Text style={styles.quickLoginButtonText}>Owner</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickLoginButton}
                  onPress={() => handleQuickLogin("manager")}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="chart.bar.fill"
                    android_material_icon_name="dashboard"
                    size={20}
                    color={colors.container}
                  />
                  <Text style={styles.quickLoginButtonText}>Manager</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickLoginButton}
                  onPress={() => handleQuickLogin("crew")}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="person.2.fill"
                    android_material_icon_name="groups"
                    size={20}
                    color={colors.container}
                  />
                  <Text style={styles.quickLoginButtonText}>Crew</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.gold} />
          </View>
        )}
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "space-between",
  },
  brandSection: {
    height: 640,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  wordmark: {
    height: 256,
  },
  bottomSection: {
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: "flex-end",
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
  quickLoginSection: {
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
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.50)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  quickLoginButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickLoginButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  quickLoginButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 0.3,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,22,40,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
