import api from './api';
import type { Sucursal } from '../types';

export const fetchSucursales = async () => {
  const { data } = await api.get('/sucursales');
  return data.data as Sucursal[];
};
