import { fetchShipments } from './shipmentService';
import { getUser } from './storageService';
import type { Shipment, User } from '../types';

type ReportKind = 'envios' | 'estadisticas';

const REPORT_TITLES: Record<ReportKind, string> = {
  envios: 'Reporte de envios',
  estadisticas: 'Reporte de estadisticas',
};

const normalizeReportKind = (path: string): ReportKind => {
  if (path.includes('estadisticas')) return 'estadisticas';
  return 'envios';
};

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Sin fecha' : parsed.toLocaleDateString('es-PE');
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const buildShipmentsRows = (shipments: Shipment[]) =>
  shipments
    .map(
      (shipment) => `
        <tr>
          <td>${escapeHtml(shipment.guia)}</td>
          <td>${escapeHtml(shipment.codigoTracking)}</td>
          <td>${escapeHtml(shipment.remitenteNombre)}</td>
          <td>${escapeHtml(shipment.destinatarioNombre)}</td>
          <td>${escapeHtml(shipment.estado)}</td>
          <td>${escapeHtml(formatDate(shipment.createdAt))}</td>
        </tr>
      `,
    )
    .join('');

const buildStatsRows = (shipments: Shipment[]) => {
  const stats = shipments.reduce<Record<string, number>>((acc, shipment) => {
    acc[shipment.estado] = (acc[shipment.estado] ?? 0) + 1;
    return acc;
  }, {});

  return ['Recibido', 'En Viaje', 'Entregado']
    .map(
      (status) => `
        <tr>
          <td>${status}</td>
          <td>${stats[status] ?? 0}</td>
          <td>${shipments.length > 0 ? Math.round(((stats[status] ?? 0) / shipments.length) * 100) : 0}%</td>
        </tr>
      `,
    )
    .join('');
};

const buildReportHtml = (kind: ReportKind, shipments: Shipment[]) => {
  const title = REPORT_TITLES[kind];
  const generatedAt = new Date().toLocaleString('es-PE');
  const content =
    kind === 'estadisticas'
      ? `
        <table>
          <thead>
            <tr>
              <th>Estado</th>
              <th>Total</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>${buildStatsRows(shipments)}</tbody>
        </table>
      `
      : `
        <table>
          <thead>
            <tr>
              <th>Guia</th>
              <th>Tracking</th>
              <th>Remitente</th>
              <th>Destinatario</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>${buildShipmentsRows(shipments)}</tbody>
        </table>
      `;

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)} - XpressPack</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 40px;
            color: #17201a;
            font-family: Arial, sans-serif;
            background: #fff;
          }
          header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            border-bottom: 2px solid #1f8f70;
            padding-bottom: 18px;
            margin-bottom: 24px;
          }
          h1 { margin: 0; font-size: 28px; }
          .brand { color: #1f8f70; font-weight: 700; letter-spacing: .04em; }
          .meta { color: #6b6b6b; font-size: 12px; text-align: right; }
          .cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin: 20px 0 28px;
          }
          .card {
            border: 1px solid #e5ded2;
            border-radius: 12px;
            padding: 14px;
            background: #fbfaf7;
          }
          .card span { display: block; color: #777; font-size: 11px; text-transform: uppercase; }
          .card strong { display: block; font-size: 22px; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th {
            background: #f3efe8;
            color: #555;
            text-align: left;
            text-transform: uppercase;
            letter-spacing: .04em;
          }
          th, td { border-bottom: 1px solid #eee7dc; padding: 10px 8px; vertical-align: top; }
          footer { margin-top: 30px; color: #777; font-size: 11px; }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <header>
          <div>
            <div class="brand">XpressPack</div>
            <h1>${escapeHtml(title)}</h1>
          </div>
          <div class="meta">
            Generado: ${escapeHtml(generatedAt)}<br />
            Total de envios: ${shipments.length}
          </div>
        </header>
        <section class="cards">
          <div class="card"><span>Recibidos</span><strong>${shipments.filter((s) => s.estado === 'Recibido').length}</strong></div>
          <div class="card"><span>En viaje</span><strong>${shipments.filter((s) => s.estado === 'En Viaje').length}</strong></div>
          <div class="card"><span>Entregados</span><strong>${shipments.filter((s) => s.estado === 'Entregado').length}</strong></div>
        </section>
        ${content}
        <footer>Reporte generado desde XpressPack. Use la opcion Guardar como PDF del navegador.</footer>
        <script>
          window.addEventListener('load', function () {
            setTimeout(function () { window.print(); }, 250);
          });
        </script>
      </body>
    </html>
  `;
};

export const downloadReport = async (path: string) => {
  const currentUser = getUser<User>();
  if (currentUser?.rol !== 'ADMIN') {
    throw new Error('403');
  }

  const kind = normalizeReportKind(path);
  const shipments = await fetchShipments();
  const reportWindow = window.open('', '_blank', 'noopener,noreferrer');

  if (!reportWindow) {
    throw new Error('POPUP_BLOCKED');
  }

  reportWindow.document.open();
  reportWindow.document.write(buildReportHtml(kind, shipments));
  reportWindow.document.close();
};

export const openReport = downloadReport;
