import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ShipmentTable from '../components/ShipmentTable';
import { fetchShipments, fetchShipmentStats } from '../services/shipmentService';
import type { Shipment } from '../types';

export default function DashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchShipments().then(setShipments).catch(() => setShipments([]));
    fetchShipmentStats().then(setStats).catch(() => setStats({}));
  }, []);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Dashboard</h1>
          <p className="text-sm text-ink/60">Resumen operativo y envios recientes</p>
        </div>
        <button className="btn" onClick={() => navigate('/app/envios/nuevo')}>Nuevo envio</button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Recibidos" value={stats['Recibido'] ?? 0} hint="Ultimas 24h" />
        <StatCard label="En viaje" value={stats['En Viaje'] ?? 0} hint="En transito" />
        <StatCard label="Entregados" value={stats['Entregado'] ?? 0} hint="Cerrados" />
      </section>

      <section className="mt-6">
        <ShipmentTable shipments={shipments.slice(0, 6)} />
      </section>
    </div>
  );
}
