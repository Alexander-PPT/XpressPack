import { getToken } from './storageService';

export interface DniResult {
  nombreCompleto: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

interface DniApiResponse {
  data?: {
    nombreCompleto?: string;
    nombre_completo?: string;
    full_name?: string;
    nombres?: string;
    first_name?: string;
    apellidoPaterno?: string;
    apellido_paterno?: string;
    first_last_name?: string;
    apellidoMaterno?: string;
    apellido_materno?: string;
    second_last_name?: string;
  };
  error?: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const normalizeDniResult = (payload: DniApiResponse): DniResult => {
  const data = payload.data ?? {};
  const apellidoPaterno = data.apellidoPaterno ?? data.apellido_paterno ?? data.first_last_name ?? '';
  const apellidoMaterno = data.apellidoMaterno ?? data.apellido_materno ?? data.second_last_name ?? '';
  const nombres = data.nombres ?? data.first_name ?? '';
  const nombreCompleto =
    data.nombreCompleto ??
    data.nombre_completo ??
    data.full_name ??
    [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ').trim();

  if (!nombreCompleto) {
    throw new Error(payload.error || 'No se encontraron nombres para el DNI ingresado');
  }

  return {
    nombreCompleto,
    nombres,
    apellidoPaterno,
    apellidoMaterno
  };
};

export const consultarDni = async (dni: string): Promise<DniResult> => {
  if (!/^\d{8}$/.test(dni)) {
    throw new Error('DNI invalido');
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase no esta configurado para consultar DNI');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/dni/${dni}`, {
    method: 'GET',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${getToken() || supabaseKey}`
    }
  });

  const payload = (await response.json()) as DniApiResponse;

  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo consultar el DNI');
  }

  return normalizeDniResult(payload);
};
