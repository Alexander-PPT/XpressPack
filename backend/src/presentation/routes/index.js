const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const buildAuthRoutes = require('./auth.routes');
const buildShipmentRoutes = require('./shipment.routes');
const buildTrackingRoutes = require('./tracking.routes');
const buildNotificationRoutes = require('./notification.routes');
const buildReportRoutes = require('./report.routes');
const buildUserRoutes = require('./user.routes');
const buildSucursalRoutes = require('./sucursal.routes');

/**
 * Configurar rutas principales
 * Agrupa todas las rutas de la API
 */
const buildRoutes = (dependencies) => {
  const router = express.Router();

  // Rutas de autenticación
  router.use('/auth', buildAuthRoutes(dependencies.controllers.authController));

  // Rutas de envíos
  router.use('/shipments', buildShipmentRoutes(dependencies.controllers.shipmentController));

  // Rutas de tracking público (sin autenticación)
  router.use('/tracking', buildTrackingRoutes(dependencies.services.shipmentService));

  // Rutas de notificaciones
  router.use('/notifications', authenticate, buildNotificationRoutes(dependencies));

  // Rutas de usuarios (admin)
  router.use('/users', buildUserRoutes(dependencies));

  // Rutas de sucursales (admin)
  router.use('/sucursales', buildSucursalRoutes(dependencies));

  // Rutas de reportes - PRÓXIMA FASE
  router.use('/reportes', authenticate, buildReportRoutes(dependencies));

  return router;
};

module.exports = buildRoutes;
