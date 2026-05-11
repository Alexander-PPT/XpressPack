const buildShipmentsReport = (shipments, filters = {}) => {
  const rows = shipments.map((shipment) => {
    const origen = shipment.sucursalOrigen?.nombre || shipment.sucursalOrigenId || '-';
    const destino = shipment.sucursalDestino?.nombre || shipment.sucursalDestinoId || '-';
    const fecha = shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString('es-PE') : '-';

    return [
      shipment.guia || '-',
      shipment.codigoTracking || '-',
      shipment.estado || '-',
      shipment.remitenteNombre || '-',
      shipment.destinatarioNombre || '-',
      origen,
      destino,
      fecha
    ];
  });

  const filtros = [
    filters.estado ? `Estado: ${filters.estado}` : null,
    filters.sucursalOrigenId ? `Origen: ${filters.sucursalOrigenId}` : null,
    filters.sucursalDestinoId ? `Destino: ${filters.sucursalDestinoId}` : null,
    filters.tipoServicio ? `Servicio: ${filters.tipoServicio}` : null,
    filters.fechaDesde ? `Desde: ${filters.fechaDesde}` : null,
    filters.fechaHasta ? `Hasta: ${filters.fechaHasta}` : null
  ].filter(Boolean).join(' | ');

  return {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      { text: 'Reporte de Envios', style: 'title' },
      { text: 'RutaSync', style: 'subtitle' },
      { text: filtros || 'Sin filtros', style: 'filters' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', 'auto', '*', '*', '*', '*', 'auto'],
          body: [
            ['Guia', 'Tracking', 'Estado', 'Remitente', 'Destinatario', 'Origen', 'Destino', 'Fecha'],
            ...rows
          ]
        },
        layout: 'lightHorizontalLines'
      }
    ],
    styles: {
      title: { fontSize: 18, bold: true, margin: [0, 0, 0, 6] },
      subtitle: { fontSize: 12, color: '#666666', margin: [0, 0, 0, 8] },
      filters: { fontSize: 10, color: '#666666', margin: [0, 0, 0, 12] }
    }
  };
};

const buildShipmentHistoryReport = (shipment, history = []) => {
  const rows = history.map((item) => [
    item.estadoAnterior || '-',
    item.estadoNuevo || '-',
    item.razon || '-',
    item.createdAt ? new Date(item.createdAt).toLocaleString('es-PE') : '-'
  ]);

  return {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      { text: 'Historial de Envio', style: 'title' },
      { text: `Guia: ${shipment.guia || '-'}`, style: 'subtitle' },
      { text: `Tracking: ${shipment.codigoTracking || '-'}`, style: 'subtitle' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto'],
          body: [
            ['Estado Anterior', 'Estado Nuevo', 'Razon', 'Fecha'],
            ...rows
          ]
        },
        layout: 'lightHorizontalLines'
      }
    ],
    styles: {
      title: { fontSize: 18, bold: true, margin: [0, 0, 0, 6] },
      subtitle: { fontSize: 11, color: '#666666', margin: [0, 0, 0, 8] }
    }
  };
};

const buildShipmentInvoiceReport = (shipment) => {
  const fecha = shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString('es-PE') : '-';
  const total = shipment.monto ? `${shipment.monto}` : '0.00';

  return {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      { text: 'Comprobante de Envio', style: 'title' },
      { text: 'RutaSync', style: 'subtitle' },
      {
        table: {
          widths: ['*', '*'],
          body: [
            ['Guia', shipment.guia || '-'],
            ['Tracking', shipment.codigoTracking || '-'],
            ['Fecha', fecha],
            ['Estado', shipment.estado || '-'],
            ['Remitente', shipment.remitenteNombre || '-'],
            ['Destinatario', shipment.destinatarioNombre || '-'],
            ['Servicio', shipment.tipoServicio || '-'],
            ['Descripcion', shipment.descripcion || '-'],
            ['Monto', `S/ ${total}`]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 10, 0, 0]
      }
    ],
    styles: {
      title: { fontSize: 18, bold: true, margin: [0, 0, 0, 6] },
      subtitle: { fontSize: 12, color: '#666666', margin: [0, 0, 0, 8] }
    }
  };
};

const buildStatsReport = (stats) => {
  const rows = Object.entries(stats || {}).map(([estado, total]) => [estado, `${total}`]);

  return {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      { text: 'Reporte de Estadisticas', style: 'title' },
      { text: 'Envios por estado', style: 'subtitle' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            ['Estado', 'Total'],
            ...rows
          ]
        },
        layout: 'lightHorizontalLines'
      }
    ],
    styles: {
      title: { fontSize: 18, bold: true, margin: [0, 0, 0, 6] },
      subtitle: { fontSize: 11, color: '#666666', margin: [0, 0, 0, 8] }
    }
  };
};

module.exports = {
  buildShipmentsReport,
  buildShipmentHistoryReport,
  buildShipmentInvoiceReport,
  buildStatsReport
};
