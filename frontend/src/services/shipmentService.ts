import api from './api';
import type { CreateEnvioRequest, Shipment, ShipmentStatus } from '../types';

export const fetchShipments = async () => {
  const { data } = await api.get('/shipments');
  return data.data as Shipment[];
};

export const fetchShipmentStats = async () => {
  const { data } = await api.get('/shipments/stats/by-status');
  return data.data as Record<string, number>;
};

export const fetchShipmentById = async (id: string) => {
  const { data } = await api.get(`/shipments/${id}`);
  return data.data as { shipment: Shipment };
};

export const createShipment = async (payload: CreateEnvioRequest) => {
  const { data } = await api.post('/shipments', payload);
  return data.data;
};

export const updateShipmentStatus = async (id: string, estado: ShipmentStatus) => {
  const { data } = await api.patch(`/shipments/${id}/estado`, { estadoNuevo: estado });
  return data.data;
};
