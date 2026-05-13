import api from './api';

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
    nombres?: string;
    apellidoPaterno?: string;
    apellido_paterno?: string;
    apellidoMaterno?: string;
    apellido_materno?: string;
  };
}

const normalizeDniResult = (payload: DniApiResponse): DniResult => {
  const data = payload.data ?? {};
  const apellidoPaterno = data.apellidoPaterno ?? data.apellido_paterno ?? '';
  const apellidoMaterno = data.apellidoMaterno ?? data.apellido_materno ?? '';
  const nombres = data.nombres ?? '';
  const nombreCompleto =
    data.nombreCompleto ??
    data.nombre_completo ??
    [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ').trim();

  if (!nombreCompleto) {
    throw new Error('No se encontraron nombres para el DNI ingresado');
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

  const { data } = await api.get<DniApiResponse>(`/dni/${dni}`);
  return normalizeDniResult(data);
};
