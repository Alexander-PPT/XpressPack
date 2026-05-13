const asyncHandler = require('../../shared/utils/async-handler');
const AppError = require('../../shared/utils/app-error');

/**
 * NotificationController
 * 
 * Maneja las peticiones HTTP relacionadas con notificaciones
 * 
 * @class NotificationController
 */
class NotificationController {
  /**
   * Constructor
   * @param {Object} notificationService - Servicio de notificaciones
   */
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  /**
   * GET /api/notifications
   * Obtener todas las notificaciones con paginación y filtros
   * 
   * Query params:
   * - page: número de página (default: 1)
   * - pageSize: cantidad por página (default: 20)
   * - estado: filtrar por estado (PENDIENTE, ENVIADO, FALLIDO)
   * - envioId: filtrar por ID de envío
   * - tipo: filtrar por tipo de notificación
   */
  getAll = asyncHandler(async (req, res) => {
    const { page = 1, pageSize = 20, estado, envioId, tipo } = req.query;

    const filters = {};
    if (estado) filters.estado = estado;
    if (envioId) filters.envioId = envioId;
    if (tipo) filters.tipo = tipo;

    const pagination = { page: parseInt(page, 10), pageSize: parseInt(pageSize, 10) };

    const result = await this.notificationService.notificationRepository.findAll(
      filters,
      pagination
    );

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/notifications/stats
   * Obtener estadísticas de notificaciones
   */
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await this.notificationService.getStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * GET /api/notifications/:id
   * Obtener notificación por ID
   */
  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await this.notificationService.notificationRepository.findById(id);

    if (!notification) {
      throw new AppError('Notificación no encontrada', 404);
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  });

  /**
   * GET /api/shipments/:envioId/notifications
   * Obtener todas las notificaciones de un envío
   */
  getByShipment = asyncHandler(async (req, res) => {
    const { envioId } = req.params;

    const notifications = await this.notificationService.notificationRepository.findByShipmentId(
      envioId
    );

    res.status(200).json({
      success: true,
      data: notifications,
    });
  });

  /**
   * POST /api/notifications/:id/retry
   * Reintentar envío de una notificación
   */
  retryNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await this.notificationService.notificationRepository.findById(id);

    if (!notification) {
      throw new AppError('Notificación no encontrada', 404);
    }

    // Reintentar envío
    await this.notificationService.sendNotification(id);

    const updated = await this.notificationService.notificationRepository.findById(id);

    res.status(200).json({
      success: true,
      message: 'Notificación reenviada',
      data: updated,
    });
  });

  /**
   * POST /api/notifications/process-pending
   * Procesar todas las notificaciones pendientes de reintento
   * 
   * Nota: Este endpoint debe estar protegido (solo ADMIN)
   */
  processPending = asyncHandler(async (req, res) => {
    await this.notificationService.processPendingRetries();

    const stats = await this.notificationService.getStatistics();

    res.status(200).json({
      success: true,
      message: 'Notificaciones pendientes procesadas',
      data: stats,
    });
  });

  /**
   * DELETE /api/notifications/cleanup
   * Limpiar notificaciones antiguas (más de 90 días)
   * 
   * Nota: Este endpoint debe estar protegido (solo ADMIN)
   */
  cleanup = asyncHandler(async (req, res) => {
    const deleted = await this.notificationService.notificationRepository.cleanupOldNotifications();

    res.status(200).json({
      success: true,
      message: `${deleted} notificaciones antiguas eliminadas`,
      data: { deletedCount: deleted },
    });
  });

  /**
   * GET /api/notifications/pending/count
   * Obtener cantidad de notificaciones pendientes
   */
  getPendingCount = asyncHandler(async (req, res) => {
    const pending = await this.notificationService.notificationRepository.findPendingRetries();

    res.status(200).json({
      success: true,
      data: {
        pendingCount: pending.length,
        notifications: pending.map(n => ({
          id: n.id,
          tipo: n.tipo,
          destinatarioEmail: n.destinatarioEmail,
          intentos: n.intentos,
          proximoIntento: n.proximoIntento,
        })),
      },
    });
  });
}

module.exports = NotificationController;
