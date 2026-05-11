import { useEffect, useState } from 'react';
import SideNav from '../components/SideNav';
import { fetchSucursales } from '../services/sucursalService';
import type { Sucursal } from '../types';

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  useEffect(() => {
    fetchSucursales().then(setSucursales).catch(() => setSucursales([]));
  }, []);

  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>Sucursales</h1>
            <p className="muted">Red de atencion y cobertura</p>
          </div>
          <button className="primary">Nueva sucursal</button>
        </header>

        <div className="table-card">
          <div className="table-header">
            <h3>Listado general</h3>
            <span>{sucursales.length} sucursales</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th>Ciudad</th>
                  <th>Departamento</th>
                </tr>
              </thead>
              <tbody>
                {sucursales.map((sucursal) => (
                  <tr key={sucursal.id}>
                    <td>{sucursal.codigo}</td>
                    <td>{sucursal.nombre}</td>
                    <td>{sucursal.ciudad}</td>
                    <td>{sucursal.departamento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
