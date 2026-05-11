import { useEffect, useState } from 'react';
import SideNav from '../components/SideNav';
import StatCard from '../components/StatCard';
import ShipmentTable from '../components/ShipmentTable';
import { fetchShipments, fetchShipmentStats } from '../services/shipmentService';
import type { Shipment } from '../types';

export default function DashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchShipments().then(setShipments).catch(() => setShipments([]));
    fetchShipmentStats().then(setStats).catch(() => setStats({}));
  }, []);

  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">Resumen operativo y envios recientes</p>
          </div>
          <button className="primary">Nuevo envio</button>
        </header>

        <section className="stat-grid">
          <StatCard label="Recibidos" value={stats['Recibido'] ?? 0} hint="Ultimas 24h" />
          <StatCard label="En viaje" value={stats['En Viaje'] ?? 0} hint="En transito" />
          <StatCard label="Entregados" value={stats['Entregado'] ?? 0} hint="Cerrados" />
        </section>

        <section className="panel">
          <ShipmentTable shipments={shipments.slice(0, 6)} />
        </section>
      </main>
    </div>
  );
}
