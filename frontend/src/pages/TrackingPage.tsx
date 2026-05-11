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
    <div className="tracking-page">
      <TopNav />
      <main className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Tracking publico</p>
          <h1>Tu envio, siempre visible</h1>
          <p>
            Consulta el estado de tu paquete en tiempo real con un codigo unico.
          </p>
          <form onSubmit={handleSearch} className="tracking-form">
            <input
              type="text"
              placeholder="Ingresa tu codigo de tracking"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </form>
          {error ? <p className="alert">{error}</p> : null}
        </div>
        <div className="hero-card">
          {shipment ? (
            <TrackingCard shipment={shipment} />
          ) : (
            <div className="ghost-card">
              <h3>Resultados en un vistazo</h3>
              <p>Introduce un codigo para ver la linea de progreso.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
