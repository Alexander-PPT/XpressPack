const { Router } = require('express');
const { authorize } = require('../middlewares/auth.middleware');

/**
 * Construir rutas de notificaciones.
 *
 * Las rutas estaticas deben declararse antes de /:id para evitar que Express
 * interprete "process-pending" o "cleanup" como identificadores dinamicos.
 *
 * @param {Object} dependencies - Dependencias inyectadas (controllers)
 * @returns {Router} Router configurado
 */
function buildNotificationRoutes(dependencies) {
  const router = Router();
  const { notificationController } = dependencies.controllers;

  router.get('/', notificationController.getAll);
  router.get('/stats', notificationController.getStatistics);
  router.get('/pending/count', notificationController.getPendingCount);

  router.post('/process-pending', authorize(['ADMIN']), notificationController.processPending);
  router.delete('/cleanup', authorize(['ADMIN']), notificationController.cleanup);

  router.get('/:id', notificationController.getById);
  router.post('/:id/retry', authorize(['ADMIN']), notificationController.retryNotification);

  return router;
}

module.exports = buildNotificationRoutes;
