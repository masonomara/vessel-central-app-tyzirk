
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'owner' | 'manager' | 'crew' | null;

interface AuthError {
  message: string;
  name: string;
  status: number;
}

interface AuthContextType {
  userRole: UserRole;
  userName: string;
  userId: string;
  isLoading: boolean;

  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;

  setUserRole: (role: UserRole) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  setUserId: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRoleState, setUserRoleState] = useState<UserRole>(null);
  const [userNameState, setUserNameState] = useState<string>('');
  const [userIdState, setUserIdState] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initializeAuth = useCallback(async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedRole = await AsyncStorage.getItem('userRole');
      const storedName = await AsyncStorage.getItem('userName');

      if (storedUserId) {
        setUserIdState(storedUserId);
        setUserRoleState(storedRole as UserRole);
        setUserNameState(storedName || '');
      }
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const signIn = async (
    _email: string,
    _password: string
  ): Promise<{ error: AuthError | null }> => {
    return { error: { message: 'Use quick login to sign in', name: 'QuickLoginRequired', status: 400 } };
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userId', 'userRole', 'userName']);
      setUserIdState('');
      setUserNameState('');
      setUserRoleState(null);
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      return { error: { message, name: 'SignOutError', status: 500 } };
    }
  };

  const setUserRole = async (role: UserRole) => {
    setUserRoleState(role);
    if (role) {
      await AsyncStorage.setItem('userRole', role);
    } else {
      await AsyncStorage.removeItem('userRole');
    }
  };

  const setUserName = async (name: string) => {
    setUserNameState(name);
    if (name) {
      await AsyncStorage.setItem('userName', name);
    } else {
      await AsyncStorage.removeItem('userName');
    }
  };

  const setUserId = async (id: string) => {
    setUserIdState(id);
    if (id) {
      await AsyncStorage.setItem('userId', id);
    } else {
      await AsyncStorage.removeItem('userId');
    }
  };

  const value: AuthContextType = {
    userRole: userRoleState,
    userName: userNameState,
    userId: userIdState,
    isLoading,
    signIn,
    signOut,
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
