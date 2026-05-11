const {
  buildShipmentsReport,
  buildShipmentHistoryReport,
  buildShipmentInvoiceReport,
  buildStatsReport
} = require('../src/shared/templates/pdf/report-templates');

describe('PDF report templates', () => {
  test('buildShipmentsReport returns doc definition', () => {
    const shipments = [
      {
        guia: 'RUT-123',
        codigoTracking: 'ABC123',
        estado: 'Recibido',
        remitenteNombre: 'Juan',
        destinatarioNombre: 'Maria',
        sucursalOrigen: { nombre: 'Lima Centro' },
        sucursalDestino: { nombre: 'Arequipa' },
        createdAt: new Date('2026-05-10T10:00:00Z')
      }
    ];

    const doc = buildShipmentsReport(shipments, { estado: 'Recibido' });

    expect(doc).toHaveProperty('content');
    expect(doc.content.length).toBeGreaterThan(0);
  });

  test('buildShipmentHistoryReport returns doc definition', () => {
    const shipment = { guia: 'RUT-123', codigoTracking: 'ABC123' };
    const history = [
      { estadoAnterior: null, estadoNuevo: 'Recibido', razon: 'Creado', createdAt: new Date() }
    ];

    const doc = buildShipmentHistoryReport(shipment, history);

    expect(doc).toHaveProperty('content');
    expect(doc.content.length).toBeGreaterThan(0);
  });

  test('buildShipmentInvoiceReport returns doc definition', () => {
    const shipment = {
      guia: 'RUT-123',
      codigoTracking: 'ABC123',
      estado: 'Entregado',
      remitenteNombre: 'Juan',
      destinatarioNombre: 'Maria',
      tipoServicio: 'EXPRESS',
      monto: 50.5
    };

    const doc = buildShipmentInvoiceReport(shipment);

    expect(doc).toHaveProperty('content');
    expect(doc.content.length).toBeGreaterThan(0);
  });

  test('buildStatsReport returns doc definition', () => {
    const doc = buildStatsReport({ Recibido: 2, 'En Viaje': 1, Entregado: 3 });

    expect(doc).toHaveProperty('content');
    expect(doc.content.length).toBeGreaterThan(0);
  });
});
