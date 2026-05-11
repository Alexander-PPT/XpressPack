const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { createShipmentRules, validate } = require('../middlewares/validation-rules');

/**
 * Configurar rutas de envíos
 */
const buildShipmentRoutes = (shipmentController) => {
  const router = express.Router();

  /**
   * POST /api/shipments
   * Privado - Crea nuevo envío (operarios)
   */
  router.post('/',
    authenticate,
    authorize(['OPERARIO', 'ADMIN']),
    createShipmentRules,
    validate,
    shipmentController.create
  );

  /**
   * GET /api/shipments
   * Privado - Obtiene listado de envíos
   */
  router.get('/',
    authenticate,
    shipmentController.getAll
  );

  /**
   * GET /api/shipments/stats/by-status
   * Privado - Estadísticas por estado
   */
  router.get('/stats/by-status',
    authenticate,
    shipmentController.getStats
  );

  /**
   * GET /api/shipments/:id
   * Privado - Detalles de envío
   */
  router.get('/:id',
    authenticate,
    shipmentController.getById
  );

  /**
   * PATCH /api/shipments/:id/estado
   * Privado - Cambiar estado (solo operarios)
   */
  router.patch('/:id/estado',
    authenticate,
    authorize(['OPERARIO', 'ADMIN']),
    shipmentController.updateStatus
  );

  /**
   * DELETE /api/shipments/:id
   * Privado - Eliminar envío (solo ADMIN)
   */
  router.delete('/:id',
    authenticate,
    authorize(['ADMIN']),
    shipmentController.delete
  );

  return router;
};

module.exports = buildShipmentRoutes;
