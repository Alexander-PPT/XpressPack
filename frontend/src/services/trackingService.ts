import api from './api';
import type { Shipment } from '../types';

export const fetchTracking = async (codigo: string) => {
  const { data } = await api.get(`/tracking/${codigo}`);
  return data.data as Shipment;
};
