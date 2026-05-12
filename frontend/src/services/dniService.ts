export interface DniResult {
  nombreCompleto: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

export const consultarDni = async (dni: string): Promise<DniResult> => {
  const baseUrl = import.meta.env.VITE_DNI_API_URL as string | undefined;
  const token = import.meta.env.VITE_DNI_API_TOKEN as string | undefined;

  if (!baseUrl || !token) {
    throw new Error('API de DNI no configurada');
  }

  if (!/^\d{8}$/.test(dni)) {
    throw new Error('DNI invalido');
  }

  const response = await fetch(`${baseUrl}/${dni}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error('DNI no encontrado en RENIEC');
    if (response.status === 429) throw new Error('Demasiadas consultas. Espera un momento.');
    throw new Error('Error al consultar el DNI');
  }

  const json = await response.json();
  if (!json.data) throw new Error('Respuesta invalida de la API');

  return {
    nombreCompleto: json.data.nombre_completo ?? '',
    nombres: json.data.nombres ?? '',
    apellidoPaterno: json.data.apellido_paterno ?? '',
    apellidoMaterno: json.data.apellido_materno ?? ''
  };
};
