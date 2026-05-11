import { useEffect, useState } from 'react';
import { fetchSucursales } from '../services/sucursalService';
import type { Sucursal } from '../types';

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  useEffect(() => {
    fetchSucursales().then(setSucursales).catch(() => setSucursales([]));
  }, []);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Sucursales</h1>
          <p className="text-sm text-ink/60">Red de atencion y cobertura</p>
        </div>
        <button className="btn">Nueva sucursal</button>
      </header>

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
