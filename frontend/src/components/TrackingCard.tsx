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
  'Recibido': 'progress-recebido',
  'En Viaje': 'progress-viaje',
  'Entregado': 'progress-entregado'
};

export default function TrackingCard({ shipment }: TrackingCardProps) {
  const statusName = shipment.estadoActual?.nombre || shipment.estado || 'Recibido';
  const progress = PROGRESS[statusName] ?? 0;

  return (
    <div className="tracking-card">
      <div className="tracking-header">
        <div>
          <p className="eyebrow">Codigo</p>
          <h3>{shipment.codigoTracking}</h3>
        </div>
        <StatusPill status={statusName} />
      </div>
      <div className="tracking-progress">
        <div className={`tracking-bar ${PROGRESS_CLASS[statusName] || ''}`}>
          <span style={{ width: `${progress}%` }}></span>
        </div>
        <p>{progress}% completado</p>
      </div>
      <div className="tracking-grid">
        <div>
          <p className="eyebrow">Remitente</p>
          <span>{shipment.remitenteNombre}</span>
        </div>
        <div>
          <p className="eyebrow">Destinatario</p>
          <span>{shipment.destinatarioNombre}</span>
        </div>
        <div>
          <p className="eyebrow">Servicio</p>
          <span>{shipment.tipoServicio}</span>
        </div>
        <div>
          <p className="eyebrow">Origen</p>
          <span>{shipment.sucursalOrigenId || shipment.sucursalOrigen || '-'}</span>
        </div>
        <div>
          <p className="eyebrow">Destino</p>
          <span>{shipment.sucursalDestinoId || shipment.sucursalDestino || '-'}</span>
        </div>
        <div>
          <p className="eyebrow">Ultimo estado</p>
          <span>{shipment.fechaEntrega || shipment.createdAt || '-'}</span>
        </div>
      </div>
    </div>
  );
}
