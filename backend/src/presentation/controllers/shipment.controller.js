const AppError = require('../../shared/utils/app-error');
const asyncHandler = require('../../shared/utils/async-handler');
const constants = require('../../shared/constants');

/**
 * Controlador de Envíos
 * Maneja CRUD y operaciones relacionadas con envíos logísticos
 */
class ShipmentController {
  constructor(shipmentService, notificationService) {
    this.shipmentService = shipmentService;
    this.notificationService = notificationService;
  }

  /**
   * POST /api/shipments
   * Crea nuevo envío con validación RENIEC
   */
  create = asyncHandler(async (req, res) => {
    const shipmentData = req.body;
    const usuarioId = req.usuario.id;

    const result = await this.shipmentService.crearEnvio(shipmentData, usuarioId);

    res.status(constants.HTTP.CREATED).json({
      success: true,
      message: 'Envío registrado exitosamente',
      data: result
    });
  });

  /**
   * GET /api/shipments
   * Obtiene todos los envíos con filtros y paginación
   */
  getAll = asyncHandler(async (req, res) => {
    const { estado, remitenteDni, destinatarioDni, page = 1, pageSize = 10 } = req.query;

    const filters = {};
    if (estado) filters.estado = estado;
    if (remitenteDni) filters.remitenteDni = remitenteDni;
    if (destinatarioDni) filters.destinatarioDni = destinatarioDni;

    const result = await this.shipmentService.obtenerEnvios(filters, {
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

    res.status(constants.HTTP.OK).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  });

  /**
   * GET /api/shipments/:id
   * Obtiene detalles de un envío específico
   */
  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const shipment = await this.shipmentService.obtenerEnvioPorId(id);

    if (!shipment) {
      throw new AppError('Envío no encontrado', constants.HTTP.NOT_FOUND);
    }

    const historial = await this.shipmentService.obtenerHistorialEstado(id);

    res.status(constants.HTTP.OK).json({
      success: true,
      data: {
        shipment,
        historial
      }
    });
  });

  /**
   * PATCH /api/shipments/:id/estado
   * Actualiza el estado de un envío
   */
  updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nuevoEstado, razon } = req.body;
    const operarioId = req.usuario.id;

    // Validar que el nuevo estado sea válido
    const estadosValidos = Object.values(constants.SHIPMENT_STATES);
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new AppError('Estado de envío inválido', constants.HTTP.BAD_REQUEST);
    }

    const shipment = await this.shipmentService.actualizarEstadoEnvio(
      id,
      nuevoEstado,
      razon,
      operarioId
    );

    if (!shipment) {
      throw new AppError('Envío no encontrado', constants.HTTP.NOT_FOUND);
    }

    res.status(constants.HTTP.OK).json({
      success: true,
      message: `Estado actualizado a ${nuevoEstado}`,
      data: shipment
    });
  });

  /**
   * DELETE /api/shipments/:id
   * Elimina un envío (solo si no está entregado)
   */
  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await this.shipmentService.eliminarEnvio(id);

    if (!result) {
      throw new AppError('Envío no encontrado o no puede ser eliminado', constants.HTTP.NOT_FOUND);
    }

    res.status(constants.HTTP.OK).json({
      success: true,
      message: 'Envío eliminado exitosamente'
    });
  });

  /**
   * GET /api/shipments/stats/by-status
   * Obtiene estadísticas de envíos por estado
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await this.shipmentService.obtenerEstadisticas();

    res.status(constants.HTTP.OK).json({
      success: true,
      data: stats
    });
  });
}

module.exports = ShipmentController;
