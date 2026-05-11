import { createContext, useContext, useMemo, useState } from 'react';
import type { User } from '../types';
import { getUser, saveUser, clearSession } from '../services/storageService';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => getUser<User>());

  const setUser = (nextUser: User | null) => {
    setUserState(nextUser);
    if (nextUser) {
      saveUser(nextUser);
    }
  };

  const logout = () => {
    clearSession();
    setUserState(null);
  };

  const value = useMemo(() => ({ user, setUser, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
