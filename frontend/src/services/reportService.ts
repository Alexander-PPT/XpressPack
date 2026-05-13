import api from './api';

const REPORT_FILE_NAMES: Record<string, string> = {
  '/reportes/envios': 'reporte-envios.pdf',
  '/reportes/estadisticas': 'reporte-estadisticas.pdf'
};

export const downloadReport = async (path: string) => {
  const response = await api.get<Blob>(path, {
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = REPORT_FILE_NAMES[path] ?? 'reporte-xpresspack.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const openReport = downloadReport;
