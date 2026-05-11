import { useEffect, useState } from 'react';
import SideNav from '../components/SideNav';
import ShipmentTable from '../components/ShipmentTable';
import { fetchShipments } from '../services/shipmentService';
import type { Shipment } from '../types';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    fetchShipments().then(setShipments).catch(() => setShipments([]));
  }, []);

  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>Envios</h1>
            <p className="muted">Lista completa y estados actuales</p>
          </div>
          <button className="primary">Registrar envio</button>
        </header>
        <ShipmentTable shipments={shipments} />
      </main>
    </div>
  );
}
