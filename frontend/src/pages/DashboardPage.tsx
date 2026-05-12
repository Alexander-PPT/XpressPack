import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import ShipmentTable from '../components/ShipmentTable';
import Button from '../components/Button';
import { fetchShipments, fetchShipmentStats } from '../services/shipmentService';
import type { Shipment } from '../types';

export default function DashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [shipsData, statsData] = await Promise.all([
          fetchShipments(),
          fetchShipmentStats(),
        ]);
        setShipments(shipsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNewShipment = () => navigate('/app/envios/nuevo');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-bold">Dashboard</h1>
          <p className="text-sm text-ink/60 mt-2">Resumen operativo y envíos en tiempo real</p>
        </div>
        <Button onClick={handleNewShipment} size="lg">
          <Plus className="h-5 w-5" />
          Nuevo envío
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Recibidos"
          value={stats['Recibido'] ?? 0}
          hint="Ultimas 24h"
          trend="up"
        />
        <StatCard
          label="En viaje"
          value={stats['En Viaje'] ?? 0}
          hint="En tránsito"
          trend="neutral"
        />
        <StatCard
          label="Entregados"
          value={stats['Entregado'] ?? 0}
          hint="Cerrados"
          trend="up"
        />
      </div>

      {/* Quick Stats Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card card-hover p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Total de envíos</p>
              <h3 className="font-display text-3xl mt-2">{shipments.length}</h3>
              <p className="text-sm text-ink/60 mt-2">En todo el sistema</p>
            </div>
            <TrendingUp className="h-8 w-8 text-pine/30" />
          </div>
        </div>

        <div className="card card-hover p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Tasa de entrega</p>
              <h3 className="font-display text-3xl mt-2">
                {shipments.length > 0
                  ? Math.round(((stats['Entregado'] ?? 0) / shipments.length) * 100)
                  : 0}%
              </h3>
              <p className="text-sm text-ink/60 mt-2">Últimos 30 días</p>
            </div>
            <TrendingUp className="h-8 w-8 text-success/30" />
          </div>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="card p-8">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold">Envíos recientes</h2>
          <p className="text-sm text-ink/60 mt-1">Últimos movimientos y estados actuales</p>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-sm text-ink/60">Cargando envíos...</p>
          </div>
        ) : (
          <ShipmentTable shipments={shipments.slice(0, 10)} />
        )}
      </div>
    </div>
  );
}
