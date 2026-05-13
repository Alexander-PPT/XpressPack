import { FileText, BarChart3, Download, Calendar } from 'lucide-react';
import { useState } from 'react';
import { downloadReport } from '../services/reportService';
import Alert from '../components/Alert';

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reports = [
    {
      id: 'envios',
      title: 'Reporte de envíos',
      description: 'Lista completa y filtrable de todos los envíos',
      icon: <FileText className="h-6 w-6" />,
      color: 'from-ocean to-oceanDark',
      buttonColor: 'btn-primary'
    },
    {
      id: 'estadisticas',
      title: 'Estadísticas',
      description: 'Resumen detallado por estado y período',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'from-pine to-pineDark',
      buttonColor: 'btn-success'
    }
  ];

  const handleDownload = async (reportId: string) => {
    setDownloading(reportId);
    setError(null);

    try {
      await downloadReport(`/reportes/${reportId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('403')) {
        setError('Solo un administrador puede descargar reportes PDF.');
      } else {
        setError('No se pudo generar el PDF. Verifica la conexion con el backend e intenta nuevamente.');
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold">Reportes</h1>
        <p className="text-sm text-ink/60 mt-2">
          Genera y descarga reportes PDF con estadísticas, historial de envíos y comprobantes
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => handleDownload(report.id)}
            disabled={downloading !== null}
            className="group card card-hover p-8 space-y-6 text-left transition hover:shadow-lg"
          >
            {/* Icon */}
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${report.color} text-white flex items-center justify-center group-hover:scale-110 transition`}>
              {report.icon}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold group-hover:text-gradient transition">{report.title}</h2>
              <p className="text-sm text-ink/60">{report.description}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 text-pine font-semibold group-hover:translate-x-1 transition">
              <Download className="h-4 w-4" />
              <span>{downloading === report.id ? 'Generando PDF...' : 'Descargar PDF'}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Info Card */}
      <div className="glass-card p-8 space-y-4">
        <div className="flex gap-4">
          <Calendar className="h-6 w-6 text-pine flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-2">Reportes automáticos</h3>
            <p className="text-sm text-ink/60">
              Los reportes se generan bajo demanda en formato PDF. Puedes descargarlos directamente desde el navegador.
              Todos los reportes incluyen datos actualizados en tiempo real desde la base de datos.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center space-y-3">
          <FileText className="h-8 w-8 text-ocean mx-auto" />
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Formato</p>
            <p className="font-semibold mt-1">PDF</p>
          </div>
        </div>
        <div className="card p-6 text-center space-y-3">
          <Download className="h-8 w-8 text-pine mx-auto" />
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Descarga</p>
            <p className="font-semibold mt-1">Instantánea</p>
          </div>
        </div>
        <div className="card p-6 text-center space-y-3">
          <Calendar className="h-8 w-8 text-amber mx-auto" />
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/50 font-semibold">Datos</p>
            <p className="font-semibold mt-1">Tiempo real</p>
          </div>
        </div>
      </div>
    </div>
  );
}
