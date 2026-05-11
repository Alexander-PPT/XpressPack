const express = require('express');

/**
 * Configurar rutas de tracking público
 */
const buildTrackingRoutes = (shipmentService) => {
  const router = express.Router();

  /**
   * GET /api/tracking/:codigo
   * Público - Obtener estado de envío sin autenticación
   */
  router.get('/:codigo', async (req, res) => {
    try {
      const { codigo } = req.params;

      const shipment = await shipmentService.obtenerEnvioPublico(codigo);

      res.status(200).json({
        success: true,
        data: shipment
      });
    } catch (error) {
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message
      });
    }
  });

  return router;
};

module.exports = buildTrackingRoutes;
