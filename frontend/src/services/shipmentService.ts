import api from './api';
import type { Shipment, CreateEnvioRequest, ShipmentStatus } from '../types';

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
  return data.data as Shipment;
};

export const updateShipmentStatus = async (id: string, nuevoEstado: ShipmentStatus) => {
  const { data } = await api.patch(`/shipments/${id}/estado`, { estado: nuevoEstado });
  return data.data as Shipment;
};
