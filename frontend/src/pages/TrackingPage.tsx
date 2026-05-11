import { useState } from 'react';
import TopNav from '../components/TopNav';
import TrackingCard from '../components/TrackingCard';
import { fetchTracking } from '../services/trackingService';
import type { Shipment } from '../types';

export default function TrackingPage() {
  const [codigo, setCodigo] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setShipment(null);

    try {
      const data = await fetchTracking(codigo.trim());
      setShipment(data);
    } catch (err) {
      setError('Codigo no encontrado. Verifica e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopNav />
      <main className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-20 pt-6 md:grid-cols-[1.2fr_0.8fr] md:px-10">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Tracking publico</p>
          <h1 className="font-display text-4xl md:text-5xl">Tu envio, siempre visible</h1>
          <p className="text-lg text-ink/70">
            Consulta el estado de tu paquete en tiempo real con un codigo unico.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
            <input
              className="input flex-1"
              type="text"
              placeholder="Ingresa tu codigo de tracking"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </form>
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        </div>
        <div>
          {shipment ? (
            <TrackingCard shipment={shipment} />
          ) : (
            <div className="glass-card space-y-2 p-6">
              <h3 className="font-display text-lg">Resultados en un vistazo</h3>
              <p className="text-sm text-ink/60">Introduce un codigo para ver la linea de progreso.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
