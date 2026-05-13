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
    return data as Shipment;
  }

  const { data } = await api.get(`/tracking/${codigo}`);
  return data.data as Shipment;
};
