import { useNavigate } from 'react-router-dom';
import type { Shipment } from '../types';
import StatusPill from './StatusPill';

interface ShipmentTableProps {
  shipments: Shipment[];
}

export default function ShipmentTable({ shipments }: ShipmentTableProps) {
  const navigate = useNavigate();

  return (
    <div className="table-card">
      <div className="table-header">
        <h3>Envios recientes</h3>
        <span>{shipments.length} registros</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Guia</th>
              <th>Tracking</th>
              <th>Remitente</th>
              <th>Destinatario</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr 
                key={shipment.id} 
                onClick={() => navigate(`/app/envios/${shipment.id}`)}
                style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-soft)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td>{shipment.guia}</td>
                <td>{shipment.codigoTracking}</td>
                <td>{shipment.remitenteNombre}</td>
                <td>{shipment.destinatarioNombre}</td>
                <td><StatusPill status={shipment.estadoActual?.nombre || 'Recibido'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
