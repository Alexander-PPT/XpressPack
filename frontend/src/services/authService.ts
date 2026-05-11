import api from './api';
import { clearSession, saveToken, saveUser } from './storageService';
import type { User } from '../types';

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  const { accessToken, usuario } = data.data;
  saveToken(accessToken);
  saveUser(usuario);
  return usuario as User;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    clearSession();
  }
};
