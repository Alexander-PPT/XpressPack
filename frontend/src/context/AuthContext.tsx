import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '../types';
import { getUser, saveUser, clearSession } from '../services/storageService';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const normalizeRole = (value: unknown): User['rol'] => {
  const normalized = String(value ?? '').trim().toUpperCase();
  return normalized === 'ADMIN' ? 'ADMIN' : 'OPERARIO';
};

const normalizePersistedUser = (raw: User | null): User | null => {
  if (!raw) return null;
  return {
    ...raw,
    rol: normalizeRole((raw as unknown as { rol?: string; role?: string }).rol ?? (raw as unknown as { role?: string }).role),
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const persisted = getUser<User>();
    setUserState(normalizePersistedUser(persisted));
    setLoading(false);
  }, []);

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

  const value = useMemo(() => ({ user, loading, setUser, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
