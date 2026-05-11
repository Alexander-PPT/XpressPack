const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { createUserRules, updateUserRules, validate } = require('../middlewares/validation-rules');

const buildUserRoutes = (dependencies) => {
  const router = express.Router();
  const { userController } = dependencies.controllers;

  router.use(authenticate, authorize(['ADMIN']));

  router.get('/', userController.getAll);
  router.get('/:id', userController.getById);
  router.post('/', createUserRules, validate, userController.create);
  router.patch('/:id', updateUserRules, validate, userController.update);
  router.patch('/:id/activar', userController.activate);
  router.delete('/:id', userController.deactivate);

  return router;
};

module.exports = buildUserRoutes;
