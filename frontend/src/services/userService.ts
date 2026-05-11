import api from './api';
import type { User } from '../types';

export const fetchUsers = async () => {
  const { data } = await api.get('/users');
  return data.data as User[];
};
