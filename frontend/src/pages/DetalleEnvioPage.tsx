import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, History, Truck, User } from 'lucide-react';
import Alert from '../components/Alert';
import Button from '../components/Button';
import StatusPill from '../components/StatusPill';
import { fetchShipmentById, updateShipmentStatus } from '../services/shipmentService';
import type { Shipment, ShipmentStatus } from '../types';

const nextActions: Array<{
  status: ShipmentStatus;
  label: string;
  helper: string;
  variant: 'primary' | 'secondary' | 'success';
}> = [
  {
    status: 'Recibido',
    label: 'Recibido',
    helper: 'Registrado en sucursal',
    variant: 'primary',
  },
  {
    status: 'En Viaje',
    label: 'En viaje',
    helper: 'Despachar paquete',
    variant: 'primary',
  },
  {
    status: 'Entregado',
    label: 'Entregado',
    helper: 'Cerrar entrega',
    variant: 'success',
  },
];

const canMoveToStatus = (current: ShipmentStatus, target: ShipmentStatus) => {
  if (target === current) return false;
  if (current === 'Entregado') return false;
  if (current === 'Recibido') return target === 'En Viaje';
  if (current === 'En Viaje') return target === 'Entregado';
  return false;
};

export default function DetalleEnvioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!id) {
      setError('Envio no encontrado.');
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);
    fetchShipmentById(id)
      .then((res) => {
        if (isMounted) setShipment(res.shipment);
      })
      .catch(() => {
        if (isMounted) setError('Error al cargar los detalles del envio.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleUpdateStatus = async (newStatus: ShipmentStatus) => {
    if (!id || !shipment) return;

    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      await updateShipmentStatus(id, newStatus);
      const res = await fetchShipmentById(id);
      setShipment(res.shipment);
      setUpdateSuccess(`Estado actualizado a ${newStatus}.`);
    } catch {
      setUpdateError('No se pudo actualizar el estado. Verifica la transicion del envio.');
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
        <Button onClick={() => navigate('/app/envios')} variant="ghost">
          <ChevronLeft className="h-5 w-5" />
          Volver
        </Button>
        <Alert type="error" title="Error" message={error || 'Envio no encontrado'} />
      </div>
    );
  }

  const currentStatus = shipment.estado || 'Recibido';

  return (
    <div className="space-y-8">
      <div>
        <Button onClick={() => navigate('/app/envios')} variant="ghost" size="sm" className="mb-4">
          <ChevronLeft className="h-4 w-4" />
          Volver a envios
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold">Detalle del envio</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-ink/60">
              <span>
                Guia: <code className="font-mono font-semibold text-ink/80">{shipment.guia}</code>
              </span>
              <span aria-hidden="true">-</span>
              <span>
                Tracking: <code className="font-mono font-semibold text-ink/80">{shipment.codigoTracking}</code>
              </span>
            </div>
          </div>
          <StatusPill status={currentStatus} />
        </div>
      </div>

      {updateError && <Alert type="error" message={updateError} onClose={() => setUpdateError(null)} />}
      {updateSuccess && <Alert type="success" message={updateSuccess} onClose={() => setUpdateSuccess(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
              </div>
            </div>
          </div>

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
              <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Descripcion</p>
              <p className="text-sm mt-2 text-ink/70">{shipment.descripcion || 'Sin descripcion'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-display text-lg font-bold">Actualizar estado</h3>
            <p className="text-sm text-ink/60">El flujo logistico es unidireccional.</p>

            <div className="space-y-3">
              {nextActions.map((action) => {
                const isCurrent = currentStatus === action.status;
                const canMove = canMoveToStatus(currentStatus, action.status);

                return (
                  <Button
                    key={action.status}
                    variant={isCurrent ? action.variant : 'secondary'}
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => handleUpdateStatus(action.status)}
                    disabled={updating || !canMove}
                  >
                    <span>{action.label}</span>
                    <span className="text-xs opacity-70">{isCurrent ? 'Actual' : action.helper}</span>
                  </Button>
                );
              })}
            </div>
          </div>

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
                    {new Date(shipment.createdAt || Date.now()).toLocaleDateString('es-PE')}
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
                  <th>Observacion</th>
                </tr>
              </thead>
              <tbody>
                {shipment.historial.map((hist) => (
                  <tr key={hist.id}>
                    <td>
                      <span className="text-sm">{new Date(hist.fechaHora).toLocaleString('es-PE')}</span>
                    </td>
                    <td>
                      <StatusPill status={hist.estado.nombre} />
                    </td>
                    <td>
                      <span className="text-sm font-medium">{hist.registradoPor.nombre}</span>
                    </td>
                    <td>
                      <span className="text-sm text-ink/60">{hist.observacion || '-'}</span>
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
