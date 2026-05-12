import { useState } from 'react';
import TopNav from '../components/TopNav';
import TrackingCard from '../components/TrackingCard';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { fetchTracking } from '../services/trackingService';
import type { Shipment } from '../types';
import { Search, Package } from 'lucide-react';

export default function TrackingPage() {
  const [codigo, setCodigo] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setShipment(null);
    setSearched(true);

    try {
      const data = await fetchTracking(codigo.trim());
      setShipment(data);
    } catch (err) {
      setError('Código de rastreo no encontrado. Por favor verifica e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand via-sand to-clay/20">
      <TopNav />
      
      <main className="container-wide py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          {/* Left Column - Search & Info */}
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pine/10 rounded-lg">
                  <Package className="h-8 w-8 text-pine" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Rastreo en tiempo real</p>
                  <h1 className="font-display text-5xl font-bold bg-gradient-to-r from-pine to-pineLight bg-clip-text text-transparent">
                    Tu envío, siempre visible
                  </h1>
                </div>
              </div>
              
              <p className="text-lg text-ink/70 leading-relaxed">
                Consulta el estado exacto de tu paquete en cualquier momento. Ingresa tu código de rastreo para ver detalles completos, ubicación actual y próximos pasos.
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                <input
                  className="input pl-12 w-full text-lg py-4"
                  type="text"
                  placeholder="Ingresa tu código de rastreo (ej: TRACK123456)"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!codigo.trim() || loading}
                  isLoading={loading}
                  size="lg"
                  className="flex-1 md:flex-none md:px-8"
                >
                  <Search className="h-5 w-5" />
                  {loading ? 'Buscando...' : 'Rastrear envío'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setCodigo('');
                    setShipment(null);
                    setError(null);
                    setSearched(false);
                  }}
                  size="lg"
                >
                  Limpiar
                </Button>
              </div>
            </form>

            {/* Errors & Messages */}
            {error && (
              <Alert
                type="error"
                title="No encontrado"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            {searched && !shipment && !error && !loading && (
              <Alert
                type="info"
                message="Ingresa un código de rastreo válido para ver los detalles de tu envío"
              />
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {[
                { icon: '📍', title: 'Ubicación en tiempo real', desc: 'Sigue tu paquete paso a paso' },
                { icon: '⏰', title: 'Actualizaciones instantáneas', desc: 'Notificaciones de cambios de estado' },
                { icon: '✔️', title: '100% Transparencia', desc: 'Toda la información en un lugar' },
                { icon: '🔒', title: 'Seguridad garantizada', desc: 'Datos encriptados y protegidos' },
              ].map((feature) => (
                <div key={feature.title} className="card p-4 flex gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-ink/60">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="sticky top-24">
            {shipment ? (
              <div className="slide-in">
                <TrackingCard shipment={shipment} />
              </div>
            ) : (
              <div className="glass-card-lg p-8 text-center space-y-4">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="font-display text-2xl font-bold">Ingresa tu código</h3>
                <p className="text-sm text-ink/60">
                  Aquí aparecerán los detalles de tu envío con información actualizada en tiempo real.
                </p>
                <div className="pt-4 space-y-2">
                  <p className="text-xs text-ink/50">💡 Tip: Tu código está en</p>
                  <p className="text-xs text-ink/50">el correo de confirmación</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center space-y-2">
            <div className="text-4xl">📧</div>
            <h3 className="font-semibold">Contacto</h3>
            <p className="text-sm text-ink/60">soporte@xpresspack.com</p>
          </div>
          <div className="card p-6 text-center space-y-2">
            <div className="text-4xl">🕐</div>
            <h3 className="font-semibold">Disponibilidad</h3>
            <p className="text-sm text-ink/60">24/7 - Todo el año</p>
          </div>
          <div className="card p-6 text-center space-y-2">
            <div className="text-4xl">🌍</div>
            <h3 className="font-semibold">Cobertura</h3>
            <p className="text-sm text-ink/60">Todo Perú</p>
          </div>
        </div>
      </main>
    </div>
  );
}
