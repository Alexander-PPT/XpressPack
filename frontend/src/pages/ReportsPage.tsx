import { openReport } from '../services/reportService';

export default function ReportsPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl">Reportes</h1>
        <p className="text-sm text-ink/60">Descarga PDF por estado, historial y comprobantes</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <button className="btn-card" onClick={() => openReport('/reportes/envios')}>
          <h3 className="font-display text-lg">Reporte de envios</h3>
          <p className="text-sm text-ink/60">Lista completa filtrable</p>
        </button>
        <button className="btn-card" onClick={() => openReport('/reportes/estadisticas')}>
          <h3 className="font-display text-lg">Estadisticas</h3>
          <p className="text-sm text-ink/60">Resumen por estado</p>
        </button>
      </section>
    </div>
  );
}
