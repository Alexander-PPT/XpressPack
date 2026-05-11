import { useState } from 'react';
import SideNav from '../components/SideNav';
import { openReport } from '../services/reportService';
import type { ShipmentStatus } from '../types';

export default function ReportsPage() {
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    estado: '' as ShipmentStatus | '',
    formato: 'pdf'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleGenerarEnvios = (e: React.FormEvent) => {
    e.preventDefault();
    openReport('/reportes', filtros as Record<string, string>);
  };

  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>Reportes</h1>
            <p className="muted">Descarga PDF o CSV con datos de envíos filtrados</p>
          </div>
        </header>

        <div className="table-card" style={{ maxWidth: '600px', marginBottom: '24px' }}>
          <h3>Generar Reporte Personalizado</h3>
          <form onSubmit={handleGenerarEnvios} className="auth-form" style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                Fecha Desde
                <input type="date" name="fechaDesde" value={filtros.fechaDesde} onChange={handleChange} style={{ width: '100%' }} />
              </label>
              <label>
                Fecha Hasta
                <input type="date" name="fechaHasta" value={filtros.fechaHasta} onChange={handleChange} style={{ width: '100%' }} />
              </label>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                Estado Logístico
                <select name="estado" value={filtros.estado} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <option value="">Todos los estados</option>
                  <option value="Recibido">Recibido</option>
                  <option value="En Viaje">En Viaje</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </label>
              <label>
                Formato de Descarga
                <select name="formato" value={filtros.formato} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <option value="pdf">Documento PDF (.pdf)</option>
                  <option value="csv">Hoja de Cálculo (.csv)</option>
                </select>
              </label>
            </div>
            
            <button type="submit" className="primary" style={{ marginTop: '8px' }}>Generar y Descargar Reporte</button>
          </form>
        </div>

        <section className="report-grid">
          <button className="report-card ghost" onClick={() => openReport('/reportes/estadisticas', { formato: 'pdf' })}>
            <h3>Estadísticas Rápidas</h3>
            <p className="muted">Descarga un resumen de métricas generales (PDF)</p>
          </button>
        </section>
      </main>
    </div>
  );
}
