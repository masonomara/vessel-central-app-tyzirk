
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows } from '../styles/commonStyles';
import { IconSymbol } from '../components/IconSymbol';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MockManager {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'manager';
}

// Mock manager database for demo mode
const MOCK_MANAGERS: MockManager[] = [
  { id: 'manager1', name: 'Sarah Johnson', email: 'sarah@vesselco.com', password: 'manager123', role: 'manager' },
  { id: 'manager2', name: 'Tom Wilson', email: 'tom@vesselco.com', password: 'manager123', role: 'manager' },
  { id: 'manager3', name: 'Alex Martinez', email: 'alex@vesselco.com', password: 'manager123', role: 'manager' },
];

export default function ManagerLoginScreen() {
  const router = useRouter();
  const { setUserRole, setUserName, setUserId } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleMockLogin = async (manager: MockManager) => {
    // Set auth context
    setUserRole(manager.role);
    setUserName(manager.name);
    setUserId(manager.id);
    
    // Store in AsyncStorage
    await AsyncStorage.setItem('authToken', 'demo-token-' + manager.id);
    await AsyncStorage.setItem('userId', manager.id);
    await AsyncStorage.setItem('userRole', manager.role);
    await AsyncStorage.setItem('userName', manager.name);
    
    setIsLoading(false);
    router.replace('/(tabs)/manager');
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);

    setTimeout(async () => {
      const manager = MOCK_MANAGERS.find(
        m => m.email.toLowerCase() === email.toLowerCase() && m.password === password
      );

      if (manager) {
        await handleMockLogin(manager);
      } else {
        setIsLoading(false);
        Alert.alert(
          'Login Failed',
          'Invalid manager credentials. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }, 1000);
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const handleQuickLogin = async () => {
    const manager = MOCK_MANAGERS[0];
    setIsLoading(true);
    setTimeout(async () => {
      await handleMockLogin(manager);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.accent, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol
                ios_icon_name="chart.bar.fill"
                android_material_icon_name="dashboard"
                size={72}
                color={colors.gold}
              />
            </View>
            <Text style={styles.logoText}>Manager Portal</Text>
            <Text style={styles.logoSubtext}>Administrative Access</Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Manager Login</Text>
          <Text style={styles.welcomeSubtext}>
            Access the management dashboard
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Manager Email</Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={20}
                color={emailError ? colors.danger : colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your manager email"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={20}
                color={passwordError ? colors.danger : colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
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
                  ios_icon_name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                  android_material_icon_name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.accent, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <React.Fragment>
                  <Text style={styles.loginButtonText}>Sign In as Manager</Text>
                  <IconSymbol
                    ios_icon_name="arrow.right"
                    android_material_icon_name="arrow-forward"
                    size={20}
                    color={colors.text}
                  />
                </React.Fragment>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Quick Login</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.quickLoginButton}
            onPress={handleQuickLogin}
            disabled={isLoading}
          >
            <View style={styles.quickLoginIcon}>
              <IconSymbol
                ios_icon_name="chart.bar.fill"
                android_material_icon_name="dashboard"
                size={32}
                color={colors.accent}
              />
            </View>
            <View style={styles.quickLoginContent}>
              <Text style={styles.quickLoginTitle}>Sarah Johnson</Text>
              <Text style={styles.quickLoginSubtitle}>Manager • sarah@vesselco.com</Text>
            </View>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.demoInfo}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.demoInfoText}>
              Credentials: sarah@vesselco.com / manager123
            </Text>
          </View>

          <View style={styles.securityNote}>
            <IconSymbol
              ios_icon_name="lock.shield.fill"
              android_material_icon_name="security"
              size={20}
              color={colors.gold}
            />
            <Text style={styles.securityNoteText}>
              Manager accounts have full administrative access to all vessels, crew, and operations.
            </Text>
          </View>

          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>Not a manager? </Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.backToLoginLink}>Regular Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceTwo,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 80 : 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 60 : 50,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceOne + '80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceOne + '40',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.gold + '50',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginTop: 20,
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeSubtext: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.danger,
    marginTop: 6,
    marginLeft: 4,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    ...shadows.medium,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  quickLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  quickLoginIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLoginContent: {
    flex: 1,
  },
  quickLoginTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  quickLoginSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceOne,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  demoInfoText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.gold + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.gold + '30',
  },
  securityNoteText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 18,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  backToLoginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
});
