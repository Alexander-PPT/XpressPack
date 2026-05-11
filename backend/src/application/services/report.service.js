const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
const AppError = require('../../shared/utils/app-error');
const reportTemplates = require('../../shared/templates/pdf/report-templates');

pdfMake.vfs = pdfFonts.pdfMake.vfs;

class ReportService {
  constructor(shipmentRepository) {
    this.shipmentRepository = shipmentRepository;
  }

  async generateShipmentsReport(filters = {}) {
    const shipments = await this.shipmentRepository.findAllForReport(filters);
    const docDefinition = reportTemplates.buildShipmentsReport(shipments, filters);
    return this._createPdfBuffer(docDefinition);
  }

  async generateShipmentHistoryReport(shipmentId) {
    const shipment = await this.shipmentRepository.findById(shipmentId);

    if (!shipment) {
      throw new AppError('Envio no encontrado', 404);
    }

    const history = await this.shipmentRepository.getStatusHistory(shipmentId);
    const docDefinition = reportTemplates.buildShipmentHistoryReport(shipment, history);
    return this._createPdfBuffer(docDefinition);
  }

  async generateShipmentInvoiceReport(shipmentId) {
    const shipment = await this.shipmentRepository.findById(shipmentId);

    if (!shipment) {
      throw new AppError('Envio no encontrado', 404);
    }

    const docDefinition = reportTemplates.buildShipmentInvoiceReport(shipment);
    return this._createPdfBuffer(docDefinition);
  }

  async generateStatsReport() {
    const stats = await this.shipmentRepository.getStatsByStatus();
    const docDefinition = reportTemplates.buildStatsReport(stats);
    return this._createPdfBuffer(docDefinition);
  }

  _createPdfBuffer(docDefinition) {
    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBuffer((buffer) => resolve(buffer));
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = ReportService;
