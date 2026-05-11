import type { ShipmentStatus } from '../types';

const STATUS_MAP: Record<ShipmentStatus, string> = {
  'Recibido': 'bg-ocean/10 text-ocean',
  'En Viaje': 'bg-amber/15 text-amber',
  'Entregado': 'bg-moss/15 text-moss'
};

interface StatusPillProps {
  status: ShipmentStatus;
}

export default function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_MAP[status]}`}>
      {status}
    </span>
  );
}
