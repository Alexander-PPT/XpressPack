import { Package, Truck, CheckCircle, MapPin, Calendar, Tag } from 'lucide-react';
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

const PROGRESS_STEPS = [
  { status: 'Recibido', icon: <Package className="h-6 w-6" /> },
  { status: 'En Viaje', icon: <Truck className="h-6 w-6" /> },
  { status: 'Entregado', icon: <CheckCircle className="h-6 w-6" /> },
];

export default function TrackingCard({ shipment }: TrackingCardProps) {
  const progress = PROGRESS[shipment.estado] ?? 0;
  const currentStepIndex = PROGRESS_STEPS.findIndex(s => s.status === shipment.estado);

  return (
    <div className="glass-card-lg space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Código de seguimiento</p>
          <h2 className="font-display text-4xl font-bold mt-2 font-mono">{shipment.codigoTracking}</h2>
          <p className="text-sm text-ink/60 mt-2">Guía: <code className="font-mono font-semibold text-ink/80">{shipment.guia}</code></p>
        </div>
        <StatusPill status={shipment.estado} />
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Progreso del envío</p>
        <div className="flex items-center justify-between">
          {PROGRESS_STEPS.map((step, index) => (
            <div key={step.status} className="flex flex-col items-center gap-2">
              <div className={`p-3 rounded-full transition ${
                index <= currentStepIndex
                  ? 'bg-pine text-white shadow-md'
                  : 'bg-clay/20 text-ink/50'
              }`}>
                {step.icon}
              </div>
              <p className="text-xs font-semibold text-center">{step.status}</p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-clay/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pine to-pineLight rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm font-semibold text-pine">{progress}% completado</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-clay/20">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="p-2 bg-pine/10 rounded-lg h-fit">
              <Package className="h-5 w-5 text-pine" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Remitente</p>
              <p className="font-semibold mt-1">{shipment.remitenteNombre}</p>
              <p className="text-sm text-ink/60">Origen: {shipment.sucursalOrigen || 'N/A'}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="p-2 bg-amber/10 rounded-lg h-fit">
              <MapPin className="h-5 w-5 text-amber" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Destinatario</p>
              <p className="font-semibold mt-1">{shipment.destinatarioNombre}</p>
              <p className="text-sm text-ink/60">Destino: {shipment.sucursalDestino || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="p-2 bg-ocean/10 rounded-lg h-fit">
              <Tag className="h-5 w-5 text-ocean" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Tipo de servicio</p>
              <p className="font-semibold mt-1">{shipment.tipoServicio}</p>
              <p className="text-sm text-ink/60">Servicio estándar</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="p-2 bg-success/10 rounded-lg h-fit">
              <Calendar className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Última actualización</p>
              <p className="font-semibold mt-1">
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

      {/* Additional Info */}
      <div className="bg-sand/50 rounded-lg p-4 space-y-3">
        <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Detalles adicionales</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-ink/60">Peso</p>
            <p className="font-semibold">{shipment.peso || 'N/A'} kg</p>
          </div>
          <div>
            <p className="text-ink/60">Dimensiones</p>
            <p className="font-semibold">{shipment.dimensiones || 'N/A'}</p>
          </div>
          <div>
            <p className="text-ink/60">Descripción</p>
            <p className="font-semibold text-xs">{shipment.descripcion || 'N/A'}</p>
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
