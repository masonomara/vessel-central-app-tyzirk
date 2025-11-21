
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'owner' | 'manager' | 'crew' | null;

interface AuthContextType {
  // User state
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  userName: string;
  userId: string;
  isLoading: boolean;
  isSupabaseEnabled: boolean;
  
  // Auth methods
  signUp: (email: string, password: string, metadata?: { name?: string; role?: UserRole }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  
  // Password management
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  
  // 2FA methods
  enrollMFA: () => Promise<{ qrCode: string; secret: string; error: AuthError | null }>;
  verifyMFA: (code: string, factorId?: string) => Promise<{ error: AuthError | null }>;
  unenrollMFA: (factorId: string) => Promise<{ error: AuthError | null }>;
  getMFAFactors: () => Promise<any[]>;
  
  // Token management
  refreshSession: () => Promise<{ error: AuthError | null }>;
  
  // Legacy setters for backward compatibility
  setUserRole: (role: UserRole) => void;
  setUserName: (name: string) => void;
  setUserId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseEnabled] = useState<boolean>(isSupabaseConfigured());

  // Initialize auth state
  useEffect(() => {
    console.log('Initializing auth state...');
    initializeAuth();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setUserId(currentSession.user.id);
          
          // Extract user metadata
          const metadata = currentSession.user.user_metadata;
          if (metadata) {
            setUserName(metadata.name || metadata.full_name || '');
            setUserRole(metadata.role || null);
          }
          
          // Store session info
          await AsyncStorage.setItem('authToken', currentSession.access_token);
          await AsyncStorage.setItem('userId', currentSession.user.id);
          if (metadata?.role) {
            await AsyncStorage.setItem('userRole', metadata.role);
          }
          if (metadata?.name) {
            await AsyncStorage.setItem('userName', metadata.name);
          }
        } else {
          setSession(null);
          setUser(null);
          setUserId('');
          setUserName('');
          setUserRole(null);
          
          // Clear stored data
          await AsyncStorage.multiRemove(['authToken', 'userId', 'userRole', 'userName']);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      if (!isSupabaseEnabled) {
        console.log('Supabase not configured, loading from AsyncStorage...');
        // Load from AsyncStorage for backward compatibility
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedRole = await AsyncStorage.getItem('userRole');
        const storedName = await AsyncStorage.getItem('userName');
        
        if (storedUserId) {
          setUserId(storedUserId);
          setUserRole(storedRole as UserRole);
          setUserName(storedName || '');
        }
        setIsLoading(false);
        return;
      }

      // Get current session from Supabase
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
        return;
      }

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setUserId(currentSession.user.id);
        
        const metadata = currentSession.user.user_metadata;
        if (metadata) {
          setUserName(metadata.name || metadata.full_name || '');
          setUserRole(metadata.role || null);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing auth:', error);
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    metadata?: { name?: string; role?: UserRole }
  ): Promise<{ error: AuthError | null }> => {
    try {
      if (!isSupabaseEnabled) {
        return { error: { message: 'Supabase is not configured', name: 'ConfigError', status: 400 } as AuthError };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata?.name || '',
            role: metadata?.role || 'crew',
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      console.log('Sign up successful:', data);
      return { error: null };
    } catch (error: any) {
      console.error('Sign up exception:', error);
      return { error: error as AuthError };
    }
  };

  // Sign in with email and password
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null }> => {
    try {
      if (!isSupabaseEnabled) {
        return { error: { message: 'Supabase is not configured', name: 'ConfigError', status: 400 } as AuthError };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful:', data);
      return { error: null };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      return { error: error as AuthError };
    }
  };

  // Sign out
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      if (!isSupabaseEnabled) {
        // Clear local storage for backward compatibility
        await AsyncStorage.multiRemove(['authToken', 'userId', 'userRole', 'userName']);
        setUserId('');
        setUserName('');
        setUserRole(null);
        return { error: null };
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      console.log('Sign out successful');
      return { error: null };
    } catch (error: any) {
      console.error('Sign out exception:', error);
      return { error: error as AuthError };
    }
  };

  // Reset password (forgot password flow)
  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      if (!isSupabaseEnabled) {
        return { error: { message: 'Supabase is not configured', name: 'ConfigError', status: 400 } as AuthError };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'vesselco://reset-password',
      });

      if (error) {
        console.error('Reset password error:', error);
        return { error };
      }

      console.log('Password reset email sent');
      return { error: null };
    } catch (error: any) {
      console.error('Reset password exception:', error);
      return { error: error as AuthError };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
    try {
      if (!isSupabaseEnabled) {
        return { error: { message: 'Supabase is not configured', name: 'ConfigError', status: 400 } as AuthError };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Update password error:', error);
        return { error };
      }

      console.log('Password updated successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Update password exception:', error);
      return { error: error as AuthError };
    }
  };

  // Enroll in MFA (Two-Factor Authentication)
  const enrollMFA = async (): Promise<{ qrCode: string; secret: string; error: AuthError | null }> => {
    try {
      if (!isSupabaseEnabled) {
        return { 
          qrCode: '', 
          secret: '', 
          error: { message: 'Supabase is not configured', name: 'ConfigError', status: 400 } as AuthError 
        };
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) {
        console.error('MFA enrollment error:', error);
        return { qrCode: '', secret: '', error };
      }

      console.log('MFA enrollment initiated');
      return {
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        error: null,
      };
    } catch (error: any) {
      console.error('MFA enrollment exception:', error);
      return { qrCode: '', secret: '', error: error as AuthError };
    }
  };

  // Verify MFA code
  const verifyMFA = async (code: string, factorId?: string): Promise<{ error: AuthError | null }> => {
    try {
      if (!isSupabaseEnabled) {
        return { error: { message: 'Supabase is not configured', name: 'ConfigError', status: 400 } as AuthError };
      }

      // If factorId is provided, verify the enrollment
      if (factorId) {
        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code,
        });

        if (error) {
          console.error('MFA verification error:', error);
          return { error };
        }
      } else {
        // Challenge existing factor
        const factors = await getMFAFactors();
        if (factors.length === 0) {
          return { error: { message: 'No MFA factors enrolled', name: 'MFAError', status: 400 } as AuthError };
        }

        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId: factors[0].id,
          code,
        });

        if (error) {
          console.error('MFA challenge error:', error);
          return { error };
        }
      }

      console.log('MFA verification successful');
      return { error: null };
    } catch (error: any) {
      console.error('MFA verification exception:', error);
      return { error: error as AuthError };
    }
  };

  // Unenroll from MFA
  const unenrollMFA = async (factorId: string): Promise<{ error: AuthError | null }> => {
    try {
      if (!isSupabaseEnabled) {
        return { error: { message: 'Supabase is not configured', name: 'ConfigError', status: 400 } as AuthError };
      }

      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) {
        console.error('MFA unenrollment error:', error);
        return { error };
      }

      console.log('MFA unenrollment successful');
      return { error: null };
    } catch (error: any) {
      console.error('MFA unenrollment exception:', error);
      return { error: error as AuthError };
    }
  };

  // Get MFA factors
  const getMFAFactors = async (): Promise<any[]> => {
    try {
      if (!isSupabaseEnabled) {
        return [];
      }

      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) {
        console.error('Error getting MFA factors:', error);
        return [];
      }

      return data?.totp || [];
    } catch (error) {
      console.error('Get MFA factors exception:', error);
      return [];
    }
  };

  // Refresh session (token refresh)
  const refreshSession = async (): Promise<{ error: AuthError | null }> => {
    try {
      if (!isSupabaseEnabled) {
        return { error: { message: 'Supabase is not configured', name: 'ConfigError', status: 400 } as AuthError };
      }

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Session refresh error:', error);
        return { error };
      }

      console.log('Session refreshed successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Session refresh exception:', error);
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    userRole,
    userName,
    userId,
    isLoading,
    isSupabaseEnabled,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    enrollMFA,
    verifyMFA,
    unenrollMFA,
    getMFAFactors,
    refreshSession,
    setUserRole,
    setUserName,
    setUserId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
