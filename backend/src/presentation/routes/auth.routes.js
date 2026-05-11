const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { loginRules, validate } = require('../middlewares/validation-rules');
const constants = require('../../shared/constants');

/**
 * Configurar rutas de autenticación
 */
const buildAuthRoutes = (authController) => {
  const router = express.Router();

  /**
   * POST /api/auth/login
   * Público - Autentica usuario con email y password
   */
  router.post('/login', 
    loginRules,
    validate,
    authController.login
  );

  /**
   * POST /api/auth/logout
   * Privado - Cierra sesión del usuario
   */
  router.post('/logout',
    authenticate,
    authController.logout
  );

  return router;
};

module.exports = buildAuthRoutes;
