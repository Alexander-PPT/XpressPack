import api from './api';
import { supabase } from '../lib/supabase';
import type { CreateEnvioRequest, Shipment, ShipmentStatus } from '../types';

const shouldUseSupabase = () => {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  return !apiUrl || apiUrl.includes('localhost');
};

export const fetchShipments = async () => {
  if (shouldUseSupabase()) {
    const { data, error } = await supabase
      .from('envios')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Shipment[];
  }

  const { data } = await api.get('/shipments');
  return data.data as Shipment[];
};

export const fetchShipmentStats = async () => {
  if (shouldUseSupabase()) {
    const shipments = await fetchShipments();
    return shipments.reduce<Record<string, number>>((acc, s) => {
      acc[s.estado] = (acc[s.estado] || 0) + 1;
      return acc;
    }, {});
  }

  const { data } = await api.get('/shipments/stats/by-status');
  return data.data as Record<string, number>;
};

export const fetchShipmentById = async (id: string) => {
  if (shouldUseSupabase()) {
    const { data, error } = await supabase
      .from('envios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { shipment: data as Shipment };
  }

  const { data } = await api.get(`/shipments/${id}`);
  return data.data as { shipment: Shipment };
};

export const createShipment = async (payload: CreateEnvioRequest) => {
  if (shouldUseSupabase()) {
    const { data, error } = await supabase
      .from('envios')
      .insert({
        guia: `GUIA-${Date.now()}`,
        codigoTracking: `TRK${Date.now().toString().slice(-8)}`,
        remitenteDni: payload.remitenteDni,
        remitenteNombre: payload.remitenteNombre,
        remitenteEmail: 'noreply@rutasync.com',
        destinatarioDni: payload.destinatarioDni,
        destinatarioNombre: payload.destinatarioNombre,
        destinatarioEmail: 'noreply@rutasync.com',
        peso: payload.peso,
        tipoServicio: payload.tipoServicio,
        descripcion: payload.descripcion,
        estado: 'Recibido',
        sucursalOrigenId: payload.sucursalOrigenId,
        sucursalDestinoId: payload.sucursalDestinoId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data } = await api.post('/shipments', payload);
  return data.data;
};

export const updateShipmentStatus = async (id: string, estado: ShipmentStatus) => {
  if (shouldUseSupabase()) {
    const { data, error } = await supabase
      .from('envios')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data } = await api.patch(`/shipments/${id}/estado`, { estadoNuevo: estado });
  return data.data;
};
