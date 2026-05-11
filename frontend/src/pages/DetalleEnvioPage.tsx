import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideNav from '../components/SideNav';
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

  if (loading) return <div className="app-shell"><SideNav /><main className="app-main"><p>Cargando detalles...</p></main></div>;
  if (error || !shipment) return <div className="app-shell"><SideNav /><main className="app-main"><p className="alert">{error || 'Envío no encontrado'}</p></main></div>;

  const currentStatus = shipment.estadoActual?.nombre || 'Recibido';

  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <header className="app-header">
          <div>
            <button className="ghost" onClick={() => navigate(-1)} style={{ marginBottom: '12px' }}>&larr; Volver</button>
            <h1>Detalle del Envío</h1>
            <p className="muted">Guía: {shipment.guia} | Tracking: {shipment.codigoTracking}</p>
          </div>
          <div>
            <StatusPill status={currentStatus} />
          </div>
        </header>

        <div className="report-grid">
          {/* Información del Envío */}
          <div className="ghost-card">
            <h3>Datos Generales</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
              <li><strong>Remitente:</strong> {shipment.remitenteNombre} (DNI: {shipment.remitenteDni})</li>
              <li style={{ marginTop: '8px' }}><strong>Destinatario:</strong> {shipment.destinatarioNombre} (DNI: {shipment.destinatarioDni})</li>
              <li style={{ marginTop: '8px' }}><strong>Servicio:</strong> {shipment.tipoServicio} ({shipment.peso} kg)</li>
              <li style={{ marginTop: '8px' }}><strong>Descripción:</strong> {shipment.descripcion || 'N/A'}</li>
            </ul>
          </div>

          {/* Acciones Logísticas */}
          <div className="ghost-card">
            <h3>Actualizar Estado Logístico</h3>
            <p className="muted" style={{ fontSize: '14px', margin: '12px 0' }}>El flujo logístico es unidireccional.</p>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                className="ghost" 
                onClick={() => handleUpdateStatus('Recibido')} 
                disabled={currentStatus === 'Recibido' || currentStatus === 'En Viaje' || currentStatus === 'Entregado'}
              >
                Marcar como Recibido
              </button>
              <button 
                className="primary" 
                onClick={() => handleUpdateStatus('En Viaje')} 
                disabled={currentStatus === 'En Viaje' || currentStatus === 'Entregado'}
              >
                Avanzar a En Viaje
              </button>
              <button 
                className="primary" 
                onClick={() => handleUpdateStatus('Entregado')} 
                disabled={currentStatus === 'Entregado' || currentStatus === 'Recibido'}
                style={{ backgroundColor: currentStatus !== 'Entregado' ? '#27ae60' : undefined }}
              >
                Registrar Entrega Exitosamente
              </button>
            </div>
          </div>
          
          {/* Historial */}
          <div className="table-card" style={{ gridColumn: 'span 2' }}>
            <h3>Historial de Cambios</h3>
            {shipment.historial && shipment.historial.length > 0 ? (
              <table style={{ marginTop: '16px', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Fecha y Hora</th>
                    <th style={{ padding: '8px' }}>Estado</th>
                    <th style={{ padding: '8px' }}>Registrado Por</th>
                    <th style={{ padding: '8px' }}>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {shipment.historial.map((hist) => (
                    <tr key={hist.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px' }}>{new Date(hist.fechaHora).toLocaleString()}</td>
                      <td style={{ padding: '8px' }}><StatusPill status={hist.estado.nombre} /></td>
                      <td style={{ padding: '8px' }}>{hist.registradoPor.nombre}</td>
                      <td style={{ padding: '8px' }}>{hist.observacion || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted" style={{ marginTop: '16px' }}>No hay historial registrado aún.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}