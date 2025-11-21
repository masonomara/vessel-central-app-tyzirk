
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
import { colors, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'manager' | 'crew';
}

// Mock user database
const MOCK_USERS: MockUser[] = [
  // Owners
  { id: 'owner1', name: 'John Smith', email: 'john@vesselco.com', password: 'owner123', role: 'owner' },
  { id: 'owner2', name: 'Emily Brown', email: 'emily@vesselco.com', password: 'owner123', role: 'owner' },
  
  // Managers
  { id: 'manager1', name: 'Sarah Johnson', email: 'sarah@vesselco.com', password: 'manager123', role: 'manager' },
  { id: 'manager2', name: 'Tom Wilson', email: 'tom@vesselco.com', password: 'manager123', role: 'manager' },
  
  // Crew
  { id: 'crew1', name: 'Mike Davis', email: 'mike@vesselco.com', password: 'crew123', role: 'crew' },
  { id: 'crew3', name: 'Jane Smith', email: 'jane@vesselco.com', password: 'crew123', role: 'crew' },
];

export default function LoginScreen() {
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

  const handleLogin = async () => {
    console.log('Login attempt with email:', email);
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    // Validation
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
    
    // Simulate network delay
    setTimeout(async () => {
      // Find user in mock database
      const user = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (user) {
        console.log('Login successful for user:', user.name, 'Role:', user.role);
        
        // Store authentication data
        try {
          await AsyncStorage.setItem('authToken', `token_${user.id}`);
          await AsyncStorage.setItem('userId', user.id);
          await AsyncStorage.setItem('userRole', user.role);
          await AsyncStorage.setItem('userName', user.name);
        } catch (error) {
          console.error('Error storing auth data:', error);
        }
        
        // Update auth context
        setUserRole(user.role);
        setUserName(user.name);
        setUserId(user.id);
        
        setIsLoading(false);
        
        // Navigate to home screen (role selection will happen there)
        router.replace('/(tabs)/(home)');
      } else {
        console.log('Login failed: Invalid credentials');
        setIsLoading(false);
        Alert.alert(
          'Login Failed',
          'Invalid email or password. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }, 1000);
  };

  const handleQuickLogin = (role: 'owner' | 'manager' | 'crew') => {
    console.log('Quick login for role:', role);
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
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
        {/* Header with Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.logoContainer}>
            <IconSymbol
              ios_icon_name="sailboat.fill"
              android_material_icon_name="sailing"
              size={72}
              color={colors.gold}
            />
            <Text style={styles.logoText}>Vessel & Co.</Text>
            <Text style={styles.logoSubtext}>Yacht Management Platform</Text>
          </View>
        </LinearGradient>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.welcomeSubtext}>Sign in to access your dashboard</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={20}
                color={emailError ? colors.danger : colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.textMuted}
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

          {/* Password Input */}
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
                placeholderTextColor={colors.textMuted}
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
                  android_material_icon_name={showPassword ? 'visibility_off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
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
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <IconSymbol
                    ios_icon_name="arrow.right"
                    android_material_icon_name="arrow_forward"
                    size={20}
                    color={colors.text}
                  />
                </React.Fragment>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Quick Login (Demo)</Text>
            <View style={styles.divider} />
          </View>

          {/* Quick Login Buttons */}
          <View style={styles.quickLoginContainer}>
            <TouchableOpacity
              style={styles.quickLoginButton}
              onPress={() => handleQuickLogin('owner')}
              disabled={isLoading}
            >
              <View style={[styles.quickLoginIcon, { backgroundColor: colors.gold + '20' }]}>
                <IconSymbol
                  ios_icon_name="crown.fill"
                  android_material_icon_name="workspace_premium"
                  size={24}
                  color={colors.gold}
                />
              </View>
              <Text style={styles.quickLoginText}>Owner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickLoginButton}
              onPress={() => handleQuickLogin('manager')}
              disabled={isLoading}
            >
              <View style={[styles.quickLoginIcon, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol
                  ios_icon_name="chart.bar.fill"
                  android_material_icon_name="dashboard"
                  size={24}
                  color={colors.accent}
                />
              </View>
              <Text style={styles.quickLoginText}>Manager</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickLoginButton}
              onPress={() => handleQuickLogin('crew')}
              disabled={isLoading}
            >
              <View style={[styles.quickLoginIcon, { backgroundColor: colors.success + '20' }]}>
                <IconSymbol
                  ios_icon_name="person.2.fill"
                  android_material_icon_name="groups"
                  size={24}
                  color={colors.success}
                />
              </View>
              <Text style={styles.quickLoginText}>Crew</Text>
            </TouchableOpacity>
          </View>

          {/* Demo Credentials Info */}
          <View style={styles.demoInfo}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.demoInfoText}>
              Tap a role above to auto-fill demo credentials
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  
  // Header
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 80 : 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  
  // Form
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
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
  
  // Input
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
    backgroundColor: colors.card,
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
  
  // Forgot Password
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  
  // Login Button
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
  },
  
  // Divider
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
  
  // Quick Login
  quickLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  quickLoginButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  quickLoginIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLoginText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.2,
  },
  
  // Demo Info
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoInfoText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
