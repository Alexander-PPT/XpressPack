import api from './api';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

const shouldUseSupabase = () => {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  return !apiUrl || apiUrl.includes('localhost');
};

export const fetchUsers = async () => {
  if (shouldUseSupabase()) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id,nombre,email,rol,estado,"sucursalId"')
      .eq('estado', true)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return (data ?? []) as User[];
  }

  const { data } = await api.get('/users');
  return data.data as User[];
};
