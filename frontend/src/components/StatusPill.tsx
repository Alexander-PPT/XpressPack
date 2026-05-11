import type { ShipmentStatus } from '../types';

const STATUS_MAP: Record<ShipmentStatus, string> = {
  'Recibido': 'status-pill status-recibido',
  'En Viaje': 'status-pill status-viaje',
  'Entregado': 'status-pill status-entregado'
};

interface StatusPillProps {
  status: ShipmentStatus;
}

export default function StatusPill({ status }: StatusPillProps) {
  return <span className={STATUS_MAP[status]}>{status}</span>;
}
