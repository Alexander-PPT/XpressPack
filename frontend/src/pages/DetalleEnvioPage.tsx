import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusPill from '../components/StatusPill';
import { fetchShipmentById, updateShipmentStatus } from '../services/shipmentService';
import type { Shipment, ShipmentStatus } from '../types';

export default function DetalleEnvioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      await updateShipmentStatus(id, newStatus);
      // Recargar datos
      const res = await fetchShipmentById(id);
      setShipment(res.shipment);
    } catch (err) {
      alert('Error al actualizar el estado. Verifica que la transición sea válida.');
    }
  };

  if (loading) {
    return (
      <div>
        <p>Cargando detalles...</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div>
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error || 'Envío no encontrado'}
        </p>
      </div>
    );
  }

  const currentStatus = shipment.estadoActual?.nombre || 'Recibido';

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <button className="btn-ghost mb-3" onClick={() => navigate(-1)}>&larr; Volver</button>
          <h1 className="font-display text-3xl">Detalle del Envío</h1>
          <p className="text-sm text-ink/60">Guía: {shipment.guia} | Tracking: {shipment.codigoTracking}</p>
        </div>
        <div>
          <StatusPill status={currentStatus} />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información del Envío */}
        <div className="glass-card p-6">
          <h3 className="font-display text-lg">Datos Generales</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink/70">
            <li><strong>Remitente:</strong> {shipment.remitenteNombre} (DNI: {shipment.remitenteDni})</li>
            <li><strong>Destinatario:</strong> {shipment.destinatarioNombre} (DNI: {shipment.destinatarioDni})</li>
            <li><strong>Servicio:</strong> {shipment.tipoServicio} ({shipment.peso} kg)</li>
            <li><strong>Descripción:</strong> {shipment.descripcion || 'N/A'}</li>
          </ul>
        </div>

        {/* Acciones Logísticas */}
        <div className="glass-card p-6">
          <h3 className="font-display text-lg">Actualizar Estado Logístico</h3>
          <p className="mt-3 text-sm text-ink/60">El flujo logístico es unidireccional.</p>
          
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="btn-ghost"
              onClick={() => handleUpdateStatus('Recibido')}
              disabled={currentStatus === 'Recibido' || currentStatus === 'En Viaje' || currentStatus === 'Entregado'}
            >
              Marcar como Recibido
            </button>
            <button
              className="btn"
              onClick={() => handleUpdateStatus('En Viaje')}
              disabled={currentStatus === 'En Viaje' || currentStatus === 'Entregado'}
            >
              Avanzar a En Viaje
            </button>
            <button
              className="btn btn-success"
              onClick={() => handleUpdateStatus('Entregado')}
              disabled={currentStatus === 'Entregado' || currentStatus === 'Recibido'}
            >
              Registrar Entrega Exitosamente
            </button>
          </div>
        </div>
        
        {/* Historial */}
        <div className="glass-card p-6 md:col-span-2">
          <h3 className="font-display text-lg">Historial de Cambios</h3>
          {shipment.historial && shipment.historial.length > 0 ? (
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-clay/60 text-left text-xs uppercase tracking-[0.2em] text-ink/50">
                  <th className="pb-2">Fecha y Hora</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Registrado Por</th>
                  <th className="pb-2">Observación</th>
                </tr>
              </thead>
              <tbody>
                {shipment.historial.map((hist) => (
                  <tr key={hist.id} className="border-b border-clay/40">
                    <td className="py-3">{new Date(hist.fechaHora).toLocaleString()}</td>
                    <td className="py-3"><StatusPill status={hist.estado.nombre} /></td>
                    <td className="py-3">{hist.registradoPor.nombre}</td>
                    <td className="py-3">{hist.observacion || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-4 text-sm text-ink/60">No hay historial registrado aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}