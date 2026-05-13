import { Package, Truck, CheckCircle, MapPin, Calendar, Tag } from 'lucide-react';
import type { Shipment } from '../types';
import StatusPill from './StatusPill';

interface TrackingCardProps {
  shipment: Shipment;
}

const PROGRESS: Record<string, number> = {
  'Recibido': 33,
  'En Viaje': 66,
  'Entregado': 100,
};

const PROGRESS_STEPS = [
  { status: 'Recibido', icon: <Package className="h-6 w-6" /> },
  { status: 'En Viaje', icon: <Truck className="h-6 w-6" /> },
  { status: 'Entregado', icon: <CheckCircle className="h-6 w-6" /> },
];

export default function TrackingCard({ shipment }: TrackingCardProps) {
  const progress = PROGRESS[shipment.estado] ?? 0;
  const currentStepIndex = PROGRESS_STEPS.findIndex((step) => step.status === shipment.estado);
  const origin = shipment.sucursalOrigen || 'Sucursal origen no registrada';
  const destination = shipment.sucursalDestino || 'Sucursal destino no registrada';

  return (
    <div className="glass-card-lg space-y-8 p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">Codigo de seguimiento</p>
          <h2 className="mt-2 font-mono font-display text-4xl font-bold">{shipment.codigoTracking}</h2>
          <p className="mt-2 text-sm text-ink/60">
            Guia: <code className="font-mono font-semibold text-ink/80">{shipment.guia}</code>
          </p>
        </div>
        <StatusPill status={shipment.estado} />
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">Progreso del envio</p>
        <div className="flex items-center justify-between">
          {PROGRESS_STEPS.map((step, index) => (
            <div key={step.status} className="flex flex-col items-center gap-2">
              <div
                className={
                  index <= currentStepIndex
                    ? 'rounded-full bg-pine p-3 text-white shadow-md transition'
                    : 'rounded-full bg-clay/20 p-3 text-ink/50 transition'
                }
              >
                {step.icon}
              </div>
              <p className="text-center text-xs font-semibold">{step.status}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-clay/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pine to-pineLight transition-all duration-500"
              style={{ width: progress + '%' }}
            />
          </div>
          <p className="text-sm font-semibold text-pine">{progress}% completado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-clay/20 pt-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="h-fit rounded-lg bg-pine/10 p-2">
              <Package className="h-5 w-5 text-pine" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">Remitente</p>
              <p className="mt-1 font-semibold">{shipment.remitenteNombre}</p>
              <p className="text-sm text-ink/60">Origen: {origin}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-fit rounded-lg bg-amber/10 p-2">
              <MapPin className="h-5 w-5 text-amber" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">Destinatario</p>
              <p className="mt-1 font-semibold">{shipment.destinatarioNombre}</p>
              <p className="text-sm text-ink/60">Destino: {destination}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="h-fit rounded-lg bg-ocean/10 p-2">
              <Tag className="h-5 w-5 text-ocean" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">Tipo de servicio</p>
              <p className="mt-1 font-semibold">{shipment.tipoServicio}</p>
              <p className="text-sm text-ink/60">Servicio estandar</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-fit rounded-lg bg-success/10 p-2">
              <Calendar className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">Ultima actualizacion</p>
              <p className="mt-1 font-semibold">
                {shipment.fechaEntrega
                  ? new Date(shipment.fechaEntrega).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : new Date(shipment.createdAt || Date.now()).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg bg-sand/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">Detalles adicionales</p>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-ink/60">Peso</p>
            <p className="font-semibold">{shipment.peso || 'N/A'} kg</p>
          </div>
          <div>
            <p className="text-ink/60">Dimensiones</p>
            <p className="font-semibold">{shipment.dimensiones || 'N/A'}</p>
          </div>
          <div>
            <p className="text-ink/60">Descripcion</p>
            <p className="text-xs font-semibold">{shipment.descripcion || 'N/A'}</p>
          </div>
          <div>
            <p className="text-ink/60">Valor</p>
            <p className="font-semibold">S/ {shipment.valorDeclarado || '0.00'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
