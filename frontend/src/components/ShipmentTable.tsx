import type { Shipment } from '../types';
import StatusPill from './StatusPill';

interface ShipmentTableProps {
  shipments: Shipment[];
}

export default function ShipmentTable({ shipments }: ShipmentTableProps) {
  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg">Envios recientes</h3>
        <span className="text-sm text-ink/60">{shipments.length} registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-ink/50">
              <th className="pb-2">Guia</th>
              <th className="pb-2">Tracking</th>
              <th className="pb-2">Remitente</th>
              <th className="pb-2">Destinatario</th>
              <th className="pb-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id} className="border-t border-clay/60">
                <td className="py-3">{shipment.guia}</td>
                <td className="py-3">{shipment.codigoTracking}</td>
                <td className="py-3">{shipment.remitenteNombre}</td>
                <td className="py-3">{shipment.destinatarioNombre}</td>
                <td className="py-3"><StatusPill status={shipment.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
