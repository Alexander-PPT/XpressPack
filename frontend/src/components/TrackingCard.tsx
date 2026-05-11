import type { Shipment } from '../types';
import StatusPill from './StatusPill';

interface TrackingCardProps {
  shipment: Shipment;
}

const PROGRESS: Record<string, number> = {
  'Recibido': 33,
  'En Viaje': 66,
  'Entregado': 100
};

const PROGRESS_CLASS: Record<string, string> = {
  'Recibido': 'bg-ocean',
  'En Viaje': 'bg-amber',
  'Entregado': 'bg-moss'
};

export default function TrackingCard({ shipment }: TrackingCardProps) {
  const progress = PROGRESS[shipment.estado] ?? 0;

  return (
    <div className="glass-card space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Codigo</p>
          <h3 className="font-display text-2xl">{shipment.codigoTracking}</h3>
        </div>
        <StatusPill status={shipment.estado} />
      </div>
      <div>
        <div className="h-2 rounded-full bg-pine/15">
          <span
            className={`block h-full rounded-full ${PROGRESS_CLASS[shipment.estado] || ''}`}
            style={{ width: `${progress}%` }}
          ></span>
        </div>
        <p className="mt-2 text-sm text-ink/60">{progress}% completado</p>
      </div>
      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Remitente</p>
          <span>{shipment.remitenteNombre}</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Destinatario</p>
          <span>{shipment.destinatarioNombre}</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Servicio</p>
          <span>{shipment.tipoServicio}</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Origen</p>
          <span>{shipment.sucursalOrigenId || shipment.sucursalOrigen || '-'}</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Destino</p>
          <span>{shipment.sucursalDestinoId || shipment.sucursalDestino || '-'}</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Ultimo estado</p>
          <span>{shipment.fechaEntrega || shipment.createdAt || '-'}</span>
        </div>
      </div>
    </div>
  );
}
