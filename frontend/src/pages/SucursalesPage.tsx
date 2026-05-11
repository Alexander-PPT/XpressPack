import { useEffect, useState } from 'react';
import SideNav from '../components/SideNav';
import { fetchSucursales } from '../services/sucursalService';
import type { Sucursal } from '../types';

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', codigo: '', ciudad: '', departamento: '' });

  useEffect(() => {
    fetchSucursales().then(setSucursales).catch(() => setSucursales([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call to create sucursal
    alert(`Llamada simulada para crear sucursal: ${formData.nombre}`);
    setShowForm(false);
  };

  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>Sucursales</h1>
            <p className="muted">Red de atencion y cobertura</p>
          </div>
          <button className="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Nueva sucursal'}
          </button>
        </header>

        {showForm && (
          <div className="table-card" style={{ marginBottom: '24px' }}>
            <h3>Registrar Nueva Sucursal</h3>
            <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '16px', gridTemplateColumns: '1fr 1fr' }}>
              <label>
                Código (Ej. LIM-01)
                <input type="text" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} required />
              </label>
              <label>
                Nombre de la Sucursal
                <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              </label>
              <label>
                Ciudad
                <input type="text" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} required />
              </label>
              <label>
                Departamento
                <input type="text" value={formData.departamento} onChange={e => setFormData({...formData, departamento: e.target.value})} required />
              </label>
              <button type="submit" className="primary" style={{ gridColumn: 'span 2' }}>Guardar Sucursal</button>
            </form>
          </div>
        )}

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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sucursales.map((sucursal) => (
                  <tr key={sucursal.id}>
                    <td>{sucursal.codigo}</td>
                    <td>{sucursal.nombre}</td>
                    <td>{sucursal.ciudad}</td>
                    <td>{sucursal.departamento}</td>
                    <td>
                      <button className="ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>Editar</button>
                    </td>
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
