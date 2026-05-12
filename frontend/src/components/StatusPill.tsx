import { Package, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import type { ShipmentStatus } from '../types';

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ReactNode;
}

const STATUS_MAP: Record<ShipmentStatus, StatusConfig> = {
  'Recibido': {
    label: 'Recibido',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: <Package className="h-4 w-4" />
  },
  'En Viaje': {
    label: 'En Viaje',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: <Truck className="h-4 w-4" />
  },
  'Entregado': {
    label: 'Entregado',
    className: 'bg-green-50 text-green-700 border border-green-200',
    icon: <CheckCircle className="h-4 w-4" />
  }
};

interface StatusPillProps {
  status: ShipmentStatus;
}

export default function StatusPill({ status }: StatusPillProps) {
  const config = STATUS_MAP[status] || {
    label: status,
    className: 'bg-gray-50 text-gray-700 border border-gray-200',
    icon: <AlertCircle className="h-4 w-4" />
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
