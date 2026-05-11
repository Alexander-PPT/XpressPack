const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../../shared/utils/app-error');
const env = require('../../config/env');

/**
 * Servicio de Autenticación
 * Maneja login, validación de contraseñas y generación de JWT
 */
class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Autentica usuario con email y contraseña
   */
  async authenticate(email, password) {
    // Valida entrada
    if (!email || !password) {
      throw new AppError('Email y contraseña son requeridos', 400);
    }

    // Busca usuario
    const usuario = await this.userRepository.findByEmail(email);
    if (!usuario) {
      throw new AppError('Email o contraseña incorrectos', 401);
    }

    // Valida contraseña
    const esValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!esValida) {
      throw new AppError('Email o contraseña incorrectos', 401);
    }

    // Valida que usuario esté activo
    if (!usuario.estado) {
      throw new AppError('Usuario desactivado', 403);
    }

    // Genera JWT
    const token = this._generarJWT(usuario);

    return {
      accessToken: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    };
  }

  /**
   * Genera JWT firmado
   */
  _generarJWT(usuario) {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId
    };

    return jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn
    });
  }

  /**
   * Revoca token (opcional - requiere Redis)
   */
  async revokeToken(token) {
    // Implementar con Redis
    // const decoded = jwt.decode(token);
    // const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    // await redis.setex(`blacklist:${decoded.sub}`, ttl, '1');
  }
}

module.exports = AuthService;
