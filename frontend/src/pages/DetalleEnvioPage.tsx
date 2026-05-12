import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, User, Truck, History } from 'lucide-react';
import StatusPill from '../components/StatusPill';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { fetchShipmentById, updateShipmentStatus } from '../services/shipmentService';
import type { Shipment, ShipmentStatus } from '../types';

export default function DetalleEnvioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchShipmentById(id)
        .then((res) => setShipment(res.shipment))
        .catch(() => setError('Error al cargar los detalles del envío.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleUpdateStatus = async (newStatus: ShipmentStatus) => {
    if (!id) return;
    setUpdating(true);
    try {
      await updateShipmentStatus(id, newStatus);
      const res = await fetchShipmentById(id);
      setShipment(res.shipment);
    } catch (err) {
      alert('Error al actualizar el estado. Verifica que la transición sea válida.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="skeleton h-10 w-40" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-3">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="space-y-6">
        <Button onClick={() => navigate(-1)} variant="ghost">
          <ChevronLeft className="h-5 w-5" />
          Volver
        </Button>
        <Alert
          type="error"
          title="Error"
          message={error || 'Envío no encontrado'}
        />
      </div>
    );
  }

  const currentStatus = shipment.estado || 'Recibido';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-4">
          <ChevronLeft className="h-4 w-4" />
          Volver a envíos
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold">Detalle del envío</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-ink/60">
              <span>Guía: <code className="font-mono font-semibold text-ink/80">{shipment.guia}</code></span>
              <span>•</span>
              <span>Tracking: <code className="font-mono font-semibold text-ink/80">{shipment.codigoTracking}</code></span>
            </div>
          </div>
          <StatusPill status={currentStatus} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sender & Receiver */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pine/10 rounded-lg">
                  <User className="h-6 w-6 text-pine" />
                </div>
                <h3 className="font-display text-lg font-bold">Remitente</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Nombre</p>
                  <p className="font-semibold mt-1">{shipment.remitenteNombre}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">DNI</p>
                  <code className="text-sm font-mono">{shipment.remitenteDni}</code>
                </div>
                {shipment.sucursalOrigen && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Sucursal origen</p>
                    <p className="text-sm text-ink/70">{shipment.sucursalOrigen}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber/10 rounded-lg">
                  <Truck className="h-6 w-6 text-amber" />
                </div>
                <h3 className="font-display text-lg font-bold">Destinatario</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Nombre</p>
                  <p className="font-semibold mt-1">{shipment.destinatarioNombre}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">DNI</p>
                  <code className="text-sm font-mono">{shipment.destinatarioDni}</code>
                </div>
                {shipment.sucursalDestino && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Sucursal destino</p>
                    <p className="text-sm text-ink/70">{shipment.sucursalDestino}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="card p-6 space-y-4">
            <h3 className="font-display text-lg font-bold">Detalles del paquete</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Peso</p>
                <p className="font-semibold mt-1">{shipment.peso || 'N/A'} kg</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Dimensiones</p>
                <p className="font-semibold mt-1 text-sm">{shipment.dimensiones || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Servicio</p>
                <p className="font-semibold mt-1">{shipment.tipoServicio}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Valor</p>
                <p className="font-semibold mt-1">S/ {shipment.valorDeclarado || '0.00'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-clay/20">
              <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Descripción</p>
              <p className="text-sm mt-2 text-ink/70">{shipment.descripcion || 'Sin descripción'}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="card p-6 space-y-4">
            <h3 className="font-display text-lg font-bold">Actualizar estado</h3>
            <p className="text-sm text-ink/60">El flujo logístico es unidireccional.</p>
            
            <div className="space-y-3">
              <Button
                variant={currentStatus === 'Recibido' ? 'primary' : 'secondary'}
                size="sm"
                className="w-full"
                onClick={() => handleUpdateStatus('Recibido')}
                disabled={updating || currentStatus !== 'Recibido'}
              >
                ✓ Recibido
              </Button>
              <Button
                variant={currentStatus === 'En Viaje' ? 'primary' : 'secondary'}
                size="sm"
                className="w-full"
                onClick={() => handleUpdateStatus('En Viaje')}
                disabled={updating || currentStatus === 'Entregado'}
              >
                ✈ En viaje
              </Button>
              <Button
                variant={currentStatus === 'Entregado' ? 'success' : 'secondary'}
                size="sm"
                className="w-full"
                onClick={() => handleUpdateStatus('Entregado')}
                disabled={updating || currentStatus === 'Recibido'}
              >
                ✓ Entregado
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-pine" />
              <h3 className="font-display font-bold">Timeline</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-pine mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Creado</p>
                  <p className="text-xs text-ink/60">
                    {new Date(shipment.createdAt).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>

              {shipment.fechaEntrega && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Entregado</p>
                    <p className="text-xs text-ink/60">
                      {new Date(shipment.fechaEntrega).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      {shipment.historial && shipment.historial.length > 0 && (
        <div className="card p-6 space-y-4">
          <h3 className="font-display text-lg font-bold">Historial de cambios</h3>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Estado</th>
                  <th>Registrado por</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                {shipment.historial.map((hist) => (
                  <tr key={hist.id}>
                    <td>
                      <span className="text-sm">
                        {new Date(hist.fechaHora).toLocaleString('es-PE')}
                      </span>
                    </td>
                    <td>
                      <StatusPill status={hist.estado.nombre} />
                    </td>
                    <td>
                      <span className="text-sm font-medium">{hist.registradoPor.nombre}</span>
                    </td>
                    <td>
                      <span className="text-sm text-ink/60">{hist.observacion || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}