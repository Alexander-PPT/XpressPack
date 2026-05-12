import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, User } from 'lucide-react';
import type { Shipment } from '../types';
import StatusPill from './StatusPill';

interface ShipmentTableProps {
  shipments: Shipment[];
  onRowClick?: (id: string) => void;
}

export default function ShipmentTable({ shipments, onRowClick }: ShipmentTableProps) {
  const navigate = useNavigate();
  const formatDate = (value?: string) => {
    if (!value) return 'Sin fecha';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'Sin fecha' : parsed.toLocaleDateString('es-PE');
  };

  const handleRowClick = (id: string) => {
    if (onRowClick) {
      onRowClick(id);
    } else {
      navigate(`/app/envios/${id}`);
    }
  };

  if (shipments.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="font-display text-lg mb-2">Sin envíos</h3>
        <p className="text-ink/60 text-sm">No hay envíos para mostrar en este momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg">Envíos</h3>
        <span className="text-xs font-semibold text-ink/50">{shipments.length} registro{shipments.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Guía</th>
              <th>Seguimiento</th>
              <th>Origen → Destino</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr
                key={shipment.id}
                onClick={() => handleRowClick(shipment.id)}
                className="cursor-pointer hover:bg-sand/50 transition group"
              >
                <td>
                  <code className="text-xs font-mono font-semibold text-pine bg-pine/10 px-2 py-1 rounded">
                    {shipment.guia}
                  </code>
                </td>
                <td>
                  <code className="text-xs font-mono text-ink/70">
                    {shipment.codigoTracking}
                  </code>
                </td>
                <td>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-ink/40" />
                      <span className="font-medium">{shipment.remitenteNombre}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink/60">
                      <User className="h-4 w-4 text-ink/40" />
                      <span>{shipment.destinatarioNombre}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <StatusPill status={shipment.estado} />
                </td>
                <td>
                  <div className="flex items-center gap-1 text-sm text-ink/60">
                    <Calendar className="h-4 w-4" />
                    {formatDate(shipment.createdAt)}
                  </div>
                </td>
                <td className="text-right">
                  <ChevronRight className="h-5 w-5 text-ink/30 group-hover:text-pine transition" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
