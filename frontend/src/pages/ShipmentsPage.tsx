import { useEffect, useState } from 'react';
import ShipmentTable from '../components/ShipmentTable';
import { fetchShipments } from '../services/shipmentService';
import type { Shipment } from '../types';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import Button from '../components/Button';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadShipments = async () => {
      try {
        if (isMounted) setLoading(true);
        const data = await fetchShipments();
        if (isMounted) {
          setShipments(data);
          setFilteredShipments(data);
        }
      } catch (error) {
        console.error('Error loading shipments:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadShipments();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let results = shipments;

    if (searchTerm) {
      results = results.filter(
        (shipment) =>
          shipment.guia.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shipment.codigoTracking.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shipment.remitenteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shipment.destinatarioNombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      results = results.filter((shipment) => shipment.estado === statusFilter);
    }

    setFilteredShipments(results);
  }, [searchTerm, statusFilter, shipments]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-bold">Envíos</h1>
          <p className="text-sm text-ink/60 mt-2">Gestiona y rastrea todos tus envíos en tiempo real</p>
        </div>
        <Button onClick={() => navigate('/app/envios/nuevo')} size="lg">
          <Plus className="h-5 w-5" />
          Registrar envío
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
            <input
              className="input pl-12 w-full"
              type="text"
              placeholder="Buscar por guía, tracking, remitente o destinatario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative flex items-center gap-2">
            <Filter className="h-5 w-5 text-ink/40" />
            <select
              className="select flex-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Recibido">Recibido</option>
              <option value="En Viaje">En Viaje</option>
              <option value="Entregado">Entregado</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-ink/60">
          Mostrando <span className="font-semibold">{filteredShipments.length}</span> de{' '}
          <span className="font-semibold">{shipments.length}</span> envíos
        </p>
      </div>

      {/* Table */}
      <div className="card p-8">
        {loading ? (
          <div className="py-12 text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-sm text-ink/60">Cargando envíos...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="font-display text-lg mb-2">Sin envíos</h3>
            <p className="text-ink/60 text-sm mb-6">
              {searchTerm || statusFilter
                ? 'No hay envíos que coincidan con tu búsqueda'
                : 'No hay envíos registrados todavía'}
            </p>
            {!(searchTerm || statusFilter) && (
              <Button onClick={() => navigate('/app/envios/nuevo')}>
                <Plus className="h-4 w-4" />
                Crear primer envío
              </Button>
            )}
          </div>
        ) : (
          <ShipmentTable shipments={filteredShipments} />
        )}
      </div>
    </div>
  );
}
