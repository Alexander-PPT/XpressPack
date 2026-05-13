import api from './api';
import { supabase } from '../lib/supabase';
import type { CreateEnvioRequest, Shipment, ShipmentStatus } from '../types';
import { getUser } from './storageService';
import { shouldUseSupabaseDirect } from './apiMode';

export const fetchShipments = async () => {
  if (shouldUseSupabaseDirect()) {
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
  if (shouldUseSupabaseDirect()) {
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
  if (shouldUseSupabaseDirect()) {
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
  if (shouldUseSupabaseDirect()) {
    const currentUser = getUser<{ email?: string }>();
    if (!currentUser?.email) {
      throw new Error('NO_SESSION');
    }

    const { data, error } = await supabase.rpc('create_envio_admin', {
      p_actor_email: currentUser.email.trim().toLowerCase(),
      p_remitente_dni: payload.remitenteDni,
      p_remitente_nombre: payload.remitenteNombre,
      p_destinatario_dni: payload.destinatarioDni,
      p_destinatario_nombre: payload.destinatarioNombre,
      p_sucursal_origen_id: payload.sucursalOrigenId,
      p_sucursal_destino_id: payload.sucursalDestinoId,
      p_peso: payload.peso,
      p_dimensiones: payload.dimensiones,
      p_tipo_servicio: payload.tipoServicio,
      p_descripcion: payload.descripcion,
      p_valor_declarado: payload.valorDeclarado ?? 0
    });

    if (error) throw error;
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('SHIPMENT_CREATE_FAILED');
    }

    return data[0] as Shipment;
  }

  const { data } = await api.post('/shipments', payload);
  return data.data;
};

export const updateShipmentStatus = async (id: string, estado: ShipmentStatus) => {
  if (shouldUseSupabaseDirect()) {
    const currentUser = getUser<{ email?: string }>();
    if (!currentUser?.email) {
      throw new Error('NO_SESSION');
    }

    const { data, error } = await supabase.rpc('update_envio_estado_admin', {
      p_actor_email: currentUser.email.trim().toLowerCase(),
      p_envio_id: id,
      p_estado: estado
    });

    if (error) throw error;
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('SHIPMENT_UPDATE_FAILED');
    }

    return data[0] as Shipment;
  }

  const { data } = await api.patch(`/shipments/${id}/estado`, { estadoNuevo: estado });
  return data.data;
};
