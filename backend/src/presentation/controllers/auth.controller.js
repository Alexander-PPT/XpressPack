const AppError = require('../../shared/utils/app-error');
const asyncHandler = require('../../shared/utils/async-handler');
const constants = require('../../shared/constants');

/**
 * Controlador de Autenticación
 * Maneja login, logout y validación de tokens
 */
class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * POST /api/auth/login
   * Autentica usuario y retorna JWT
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await this.authService.authenticate(email, password);

    res.status(constants.HTTP.OK).json({
      success: true,
      message: 'Usuario autenticado exitosamente',
      data: result
    });
  });

  /**
   * POST /api/auth/logout
   * Invalida token JWT
   */
  logout = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.substring(7);

    if (token) {
      await this.authService.revokeToken(token);
    }

    res.status(constants.HTTP.OK).json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  });
}

module.exports = AuthController;
