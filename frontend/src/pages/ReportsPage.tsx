import SideNav from '../components/SideNav';
import { openReport } from '../services/reportService';

export default function ReportsPage() {
  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>Reportes</h1>
            <p className="muted">Descarga PDF por estado, historial y comprobantes</p>
          </div>
        </header>

        <section className="report-grid">
          <button className="report-card" onClick={() => openReport('/reportes/envios')}>
            <h3>Reporte de envios</h3>
            <p>Lista completa filtrable</p>
          </button>
          <button className="report-card" onClick={() => openReport('/reportes/estadisticas')}>
            <h3>Estadisticas</h3>
            <p>Resumen por estado</p>
          </button>
        </section>
      </main>
    </div>
  );
}
