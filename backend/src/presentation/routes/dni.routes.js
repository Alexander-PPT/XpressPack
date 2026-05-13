const express = require('express');
const { authorize } = require('../middlewares/auth.middleware');

const buildDniRoutes = (dniController) => {
  const router = express.Router();

  router.get('/:dni', authorize(['ADMIN', 'OPERARIO']), dniController.lookup);

  return router;
};

module.exports = buildDniRoutes;
