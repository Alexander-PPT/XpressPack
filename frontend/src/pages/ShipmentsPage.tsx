import { useEffect, useState } from 'react';
import ShipmentTable from '../components/ShipmentTable';
import { fetchShipments } from '../services/shipmentService';
import type { Shipment } from '../types';
import { useNavigate } from 'react-router-dom';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShipments().then(setShipments).catch(() => setShipments([]));
  }, []);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Envios</h1>
          <p className="text-sm text-ink/60">Lista completa y estados actuales</p>
        </div>
        <button className="btn" onClick={() => navigate('/app/envios/nuevo')}>Registrar envio</button>
      </header>
      <ShipmentTable shipments={shipments} />
    </div>
  );
}
