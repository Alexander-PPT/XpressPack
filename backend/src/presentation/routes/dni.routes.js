const express = require('express');

const buildDniRoutes = (dniController) => {
  const router = express.Router();

  // Permitir que cualquier usuario autenticado consulte DNIs
  router.get('/:dni', dniController.lookup);

  return router;
};

module.exports = buildDniRoutes;
