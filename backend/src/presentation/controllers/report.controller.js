const asyncHandler = require('../../shared/utils/async-handler');

class ReportController {
  constructor(reportService) {
    this.reportService = reportService;
  }

  getShipmentsReport = asyncHandler(async (req, res) => {
    const {
      estado,
      sucursalOrigenId,
      sucursalDestinoId,
      tipoServicio,
      fechaDesde,
      fechaHasta
    } = req.query;

    const filters = {
      estado,
      sucursalOrigenId,
      sucursalDestinoId,
      tipoServicio,
      fechaDesde,
      fechaHasta
    };

    const buffer = await this.reportService.generateShipmentsReport(filters);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="reporte-envios.pdf"');
    res.status(200).send(buffer);
  });

  getShipmentHistoryReport = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const buffer = await this.reportService.generateShipmentHistoryReport(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="reporte-historial-envio.pdf"');
    res.status(200).send(buffer);
  });

  getShipmentInvoiceReport = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const buffer = await this.reportService.generateShipmentInvoiceReport(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="comprobante-envio.pdf"');
    res.status(200).send(buffer);
  });

  getStatsReport = asyncHandler(async (req, res) => {
    const buffer = await this.reportService.generateStatsReport();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="reporte-estadisticas.pdf"');
    res.status(200).send(buffer);
  });
}

module.exports = ReportController;
