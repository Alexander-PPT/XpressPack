const ReportService = require('../../src/application/services/report.service');

jest.mock('pdfmake/build/pdfmake', () => {
  return {
    createPdf: () => ({
      getBuffer: (cb) => cb(Buffer.from('test'))
    })
  };
});

jest.mock('pdfmake/build/vfs_fonts', () => ({
  pdfMake: { vfs: {} }
}));

jest.mock('../../src/shared/templates/pdf/report-templates', () => ({
  buildShipmentsReport: jest.fn(() => ({ content: [] })),
  buildShipmentHistoryReport: jest.fn(() => ({ content: [] })),
  buildShipmentInvoiceReport: jest.fn(() => ({ content: [] })),
  buildStatsReport: jest.fn(() => ({ content: [] }))
}));

const AppError = require('../../src/shared/utils/app-error');
const reportTemplates = require('../../src/shared/templates/pdf/report-templates');

describe('ReportService', () => {
  const shipmentRepository = {
    findAllForReport: jest.fn(),
    findById: jest.fn(),
    getStatusHistory: jest.fn(),
    getStatsByStatus: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generateShipmentsReport uses repository and template', async () => {
    shipmentRepository.findAllForReport.mockResolvedValue([]);

    const service = new ReportService(shipmentRepository);
    const buffer = await service.generateShipmentsReport({ estado: 'Recibido' });

    expect(shipmentRepository.findAllForReport).toHaveBeenCalled();
    expect(reportTemplates.buildShipmentsReport).toHaveBeenCalled();
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  test('generateShipmentHistoryReport throws if shipment missing', async () => {
    shipmentRepository.findById.mockResolvedValue(null);

    const service = new ReportService(shipmentRepository);

    await expect(service.generateShipmentHistoryReport('s1')).rejects.toBeInstanceOf(AppError);
  });
});
