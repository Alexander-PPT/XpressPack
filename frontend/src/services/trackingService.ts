import api from './api';
import { supabase } from '../lib/supabase';
import type { Shipment } from '../types';
import { shouldUseSupabaseDirect } from './apiMode';

export const fetchTracking = async (codigo: string) => {
  if (shouldUseSupabaseDirect()) {
    const { data, error } = await supabase
      .from('envios')
      .select('*')
      .eq('codigoTracking', codigo.toUpperCase())
      .single();

    if (error || !data) throw new Error('Codigo de tracking no encontrado');

    const shipment = data as Shipment;
    const branchIds = [shipment.sucursalOrigenId, shipment.sucursalDestinoId].filter(Boolean);

    if (branchIds.length === 0) {
      return shipment;
    }

    const { data: branches } = await supabase
      .from('sucursales')
      .select('id,nombre,ciudad')
      .in('id', branchIds);

    const branchesById = new Map(
      (branches ?? []).map((branch) => [
        branch.id,
        `${branch.nombre}${branch.ciudad ? ` (${branch.ciudad})` : ''}`,
      ])
    );

    return {
      ...shipment,
      sucursalOrigen: shipment.sucursalOrigenId
        ? branchesById.get(shipment.sucursalOrigenId) ?? null
        : null,
      sucursalDestino: shipment.sucursalDestinoId
        ? branchesById.get(shipment.sucursalDestinoId) ?? null
        : null,
    } as Shipment;
  }

  const { data } = await api.get(`/tracking/${codigo}`);
  return data.data as Shipment;
};
