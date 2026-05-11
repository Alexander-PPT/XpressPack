const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { createSucursalRules, updateSucursalRules, validate } = require('../middlewares/validation-rules');

const buildSucursalRoutes = (dependencies) => {
  const router = express.Router();
  const { sucursalController } = dependencies.controllers;

  router.use(authenticate, authorize(['ADMIN']));

  router.get('/', sucursalController.getAll);
  router.get('/:id', sucursalController.getById);
  router.post('/', createSucursalRules, validate, sucursalController.create);
  router.patch('/:id', updateSucursalRules, validate, sucursalController.update);
  router.patch('/:id/activar', sucursalController.activate);
  router.delete('/:id', sucursalController.deactivate);

  return router;
};

module.exports = buildSucursalRoutes;
