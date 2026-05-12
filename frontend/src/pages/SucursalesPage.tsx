import { useEffect, useState } from 'react';
import { createSucursal, fetchSucursales } from '../services/sucursalService';
import { MapPin, Building2, Plus, Code, Home, MapIcon } from 'lucide-react';
import type { Sucursal } from '../types';
import Button from '../components/Button';

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    ciudad: '',
    departamento: '',
    direccion: ''
  });

  useEffect(() => {
    let isMounted = true;
    const loadSucursales = async () => {
      try {
        if (isMounted) setLoading(true);
        const data = await fetchSucursales();
        if (isMounted) setSucursales(data);
      } catch (error) {
        console.error('Error loading sucursales:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSucursales();

    return () => {
      isMounted = false;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const created = await createSucursal(form);
      setSucursales((prev) => [created, ...prev]);
      setForm({ codigo: '', nombre: '', ciudad: '', departamento: '', direccion: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating sucursal:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-bold">Sucursales</h1>
          <p className="text-sm text-ink/60 mt-2">Red de atención y cobertura de XpressPack</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="h-5 w-5" />
          Nueva sucursal
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card p-8 space-y-6 slide-in">
          <div>
            <h2 className="font-display text-2xl font-bold">Registrar nueva sucursal</h2>
            <p className="text-sm text-ink/60 mt-1">Amplía la red de cobertura agregando nuevas sucursales.</p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="form-row">
              <div className="form-group">
                <label className="field-label required">Código</label>
                <div className="relative">
                  <Code className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                  <input
                    className="input pl-12"
                    placeholder="SUC001"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    required
                    disabled={creating}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="field-label required">Nombre de sucursal</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                  <input
                    className="input pl-12"
                    placeholder="Sucursal Centro"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    required
                    disabled={creating}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="field-label required">Ciudad</label>
                <div className="relative">
                  <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                  <input
                    className="input pl-12"
                    placeholder="Lima"
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    required
                    disabled={creating}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="field-label required">Departamento</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                  <input
                    className="input pl-12"
                    placeholder="Lima"
                    value={form.departamento}
                    onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                    required
                    disabled={creating}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="field-label required">Dirección</label>
              <div className="relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                <input
                  className="input pl-12"
                  placeholder="Avenida Principal 123, Piso 5"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  required
                  disabled={creating}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowForm(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating} isLoading={creating}>
                Crear sucursal
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Sucursales Grid */}
      <div>
        {loading ? (
          <div className="py-12 text-center card p-8">
            <div className="spinner mx-auto mb-4" />
            <p className="text-sm text-ink/60">Cargando sucursales...</p>
          </div>
        ) : sucursales.length === 0 ? (
          <div className="py-12 text-center card p-8">
            <Building2 className="h-12 w-12 text-ink/20 mx-auto mb-4" />
            <h3 className="font-display text-lg mb-2">Sin sucursales</h3>
            <p className="text-ink/60 text-sm mb-6">No hay sucursales registradas todavía</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Crear primera sucursal
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pine/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-pine" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Red de sucursales</h2>
                  <p className="text-sm text-ink/60">{sucursales.length} ubicación{sucursales.length !== 1 ? 'es' : ''} activas</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sucursales.map((sucursal) => (
                <div key={sucursal.id} className="card card-hover p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-pine/10 rounded-lg">
                      <Building2 className="h-6 w-6 text-pine" />
                    </div>
                    <code className="text-xs font-mono font-semibold bg-clay/20 px-2 py-1 rounded">
                      {sucursal.codigo}
                    </code>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Nombre</p>
                      <h3 className="font-display text-lg font-bold mt-1">{sucursal.nombre}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Ciudad</p>
                        <p className="font-semibold mt-1">{sucursal.ciudad}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Depto</p>
                        <p className="font-semibold mt-1">{sucursal.departamento}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Dirección</p>
                      <p className="text-sm mt-1 text-ink/70">{sucursal.direccion}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-clay/20 flex items-center gap-2 text-xs text-ink/60">
                    <MapPin className="h-4 w-4" />
                    <span>Activa</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center space-y-3">
          <Building2 className="h-8 w-8 text-pine mx-auto" />
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Total</p>
            <p className="font-display text-3xl font-bold mt-1">{sucursales.length}</p>
          </div>
        </div>
        <div className="card p-6 text-center space-y-3">
          <MapIcon className="h-8 w-8 text-ocean mx-auto" />
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Ciudades</p>
            <p className="font-display text-3xl font-bold mt-1">
              {new Set(sucursales.map(s => s.ciudad)).size}
            </p>
          </div>
        </div>
        <div className="card p-6 text-center space-y-3">
          <MapPin className="h-8 w-8 text-success mx-auto" />
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Estado</p>
            <p className="font-semibold mt-1">Activas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
