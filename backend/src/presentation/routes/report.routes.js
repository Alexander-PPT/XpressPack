const express = require('express');
const { authorize } = require('../middlewares/auth.middleware');

const buildReportRoutes = (dependencies) => {
  const router = express.Router();
  const { reportController } = dependencies.controllers;

  router.get('/envios',
    authorize(['ADMIN', 'OPERARIO']),
    reportController.getShipmentsReport
  );

  router.get('/envios/:id/historial',
    authorize(['ADMIN', 'OPERARIO']),
    reportController.getShipmentHistoryReport
  );

  router.get('/envios/:id/comprobante',
    authorize(['ADMIN', 'OPERARIO']),
    reportController.getShipmentInvoiceReport
  );

  router.get('/estadisticas',
    authorize(['ADMIN', 'OPERARIO']),
    reportController.getStatsReport
  );

  return router;
};

module.exports = buildReportRoutes;
