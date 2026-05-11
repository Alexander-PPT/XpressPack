const { Router } = require('express');
const asyncHandler = require('../../shared/utils/asyncHandler');

/**
 * Construir rutas de notificaciones
 * 
 * @param {Object} dependencies - Dependencias inyectadas (controllers)
 * @returns {Router} Router configurado
 */
function buildNotificationRoutes(dependencies) {
  const router = Router();
  const { notificationController } = dependencies.controllers;

  /**
   * GET /api/notifications
   * Listar todas las notificaciones (con filtros y paginación)
   * 
   * Query params:
   * - page: número de página
   * - pageSize: registros por página
   * - estado: PENDIENTE | ENVIADO | FALLIDO
   * - envioId: filtrar por ID de envío
   * - tipo: tipo de notificación
   */
  router.get('/', notificationController.getAll);

  /**
   * GET /api/notifications/stats
   * Obtener estadísticas de notificaciones
   */
  router.get('/stats', notificationController.getStatistics);

  /**
   * GET /api/notifications/pending/count
   * Obtener conteo de notificaciones pendientes
   */
  router.get('/pending/count', notificationController.getPendingCount);

  /**
   * GET /api/notifications/:id
   * Obtener notificación por ID
   * 
   * Params:
   * - id: UUID de la notificación
   */
  router.get('/:id', notificationController.getById);

  /**
   * POST /api/notifications/:id/retry
   * Reintentar envío de una notificación fallida
   */
  router.post('/:id/retry', notificationController.retryNotification);

  /**
   * POST /api/notifications/process-pending
   * Procesar todas las notificaciones pendientes
   * 
   * Solo ADMIN
   */
  router.post('/process-pending', notificationController.processPending);

  /**
   * DELETE /api/notifications/cleanup
   * Limpiar notificaciones antiguas (>90 días)
   * 
   * Solo ADMIN
   */
  router.delete('/cleanup', notificationController.cleanup);

  return router;
}

module.exports = buildNotificationRoutes;
