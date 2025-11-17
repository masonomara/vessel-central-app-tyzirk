
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'owner' | 'manager' | 'crew' | null;

interface AuthContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userName: string;
  setUserName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState<string>('');

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, userName, setUserName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
