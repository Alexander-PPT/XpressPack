import { useEffect, useState } from 'react';
import { createSucursal, fetchSucursales } from '../services/sucursalService';
import type { Sucursal } from '../types';

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    ciudad: '',
    departamento: '',
    direccion: ''
  });

  useEffect(() => {
    fetchSucursales().then(setSucursales).catch(() => setSucursales([]));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const created = await createSucursal(form);
      setSucursales((prev) => [created, ...prev]);
      setForm({ codigo: '', nombre: '', ciudad: '', departamento: '', direccion: '' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Sucursales</h1>
          <p className="text-sm text-ink/60">Red de atencion y cobertura</p>
        </div>
        <button className="btn" onClick={() => document.getElementById('sucursal-create-form')?.scrollIntoView({ behavior: 'smooth' })}>Nueva sucursal</button>
      </header>

      <form id="sucursal-create-form" onSubmit={submit} className="glass-card mb-6 grid gap-3 p-4 md:grid-cols-3">
        <input className="input" placeholder="Codigo" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required />
        <input className="input" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        <input className="input" placeholder="Ciudad" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} required />
        <input className="input" placeholder="Departamento" value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} required />
        <input className="input md:col-span-2" placeholder="Direccion" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} required />
        <button className="btn md:col-span-3" type="submit" disabled={creating}>{creating ? 'Guardando...' : 'Crear sucursal'}</button>
      </form>

      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg">Listado general</h3>
          <span className="text-sm text-ink/60">{sucursales.length} sucursales</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-ink/50">
                <th className="pb-2">Codigo</th>
                <th className="pb-2">Nombre</th>
                <th className="pb-2">Ciudad</th>
                <th className="pb-2">Departamento</th>
              </tr>
            </thead>
            <tbody>
              {sucursales.map((sucursal) => (
                <tr key={sucursal.id} className="border-t border-clay/60">
                  <td className="py-3">{sucursal.codigo}</td>
                  <td className="py-3">{sucursal.nombre}</td>
                  <td className="py-3">{sucursal.ciudad}</td>
                  <td className="py-3">{sucursal.departamento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
