import { useCallback, useRef, useState } from 'react';
import { consultarDni } from '../services/dniService';

interface UseDniLookupReturn {
  lookupDni: (dni: string) => Promise<string | null>;
  dniLoading: boolean;
  dniError: string | null;
  clearDniError: () => void;
}

export function useDniLookup(): UseDniLookupReturn {
  const [dniLoading, setDniLoading] = useState(false);
  const [dniError, setDniError] = useState<string | null>(null);
  const lastQueried = useRef<string>('');

  const lookupDni = useCallback(async (dni: string): Promise<string | null> => {
    if (!/^\d{8}$/.test(dni)) return null;
    if (dni === lastQueried.current) return null;

    lastQueried.current = dni;
    setDniLoading(true);
    setDniError(null);

    try {
      const result = await consultarDni(dni);
      return result.nombreCompleto;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al consultar DNI';
      setDniError(msg);
      return null;
    } finally {
      setDniLoading(false);
    }
  }, []);

  const clearDniError = useCallback(() => setDniError(null), []);

  return { lookupDni, dniLoading, dniError, clearDniError };
}
