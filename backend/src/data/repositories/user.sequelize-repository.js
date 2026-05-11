/**
 * Implementación del Repositorio de Usuario con Sequelize
 * Acceso a datos para entidad Usuario
 */
class UserSequelizeRepository {
  constructor(userModel) {
    this.userModel = userModel;
  }

  /**
   * Busca usuario por ID
   */
  async findById(id) {
    return await this.userModel.findByPk(id, {
      attributes: { exclude: ['passwordHash'] }
    });
  }

  /**
   * Busca usuario por email (incluye hash para autenticación)
   */
  async findByEmail(email) {
    return await this.userModel.findOne({
      where: { email }
    });
  }

  /**
   * Obtiene todos los usuarios con filtros opcionales
   */
  async findAll(filters = {}) {
    const where = {};
    
    if (filters.rol) where.rol = filters.rol;
    if (filters.estado !== undefined) where.estado = filters.estado;
    if (filters.sucursalId) where.sucursalId = filters.sucursalId;

    return await this.userModel.findAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      order: [['nombre', 'ASC']]
    });
  }

  /**
   * Crea nuevo usuario
   */
  async create(usuarioData) {
    return await this.userModel.create(usuarioData, {
      attributes: { exclude: ['passwordHash'] }
    });
  }

  /**
   * Actualiza usuario
   */
  async update(id, usuarioData) {
    const usuario = await this.userModel.findByPk(id);
    
    if (!usuario) {
      return null;
    }

    // No permitir actualizar email (unique) ni password directamente
    const { email, passwordHash, ...datosPermitidos } = usuarioData;

    return await usuario.update(datosPermitidos, {
      attributes: { exclude: ['passwordHash'] }
    });
  }

  /**
   * Elimina usuario (soft delete - desactiva)
   */
  async delete(id) {
    const usuario = await this.userModel.findByPk(id);
    
    if (!usuario) {
      return null;
    }

    return await usuario.update({ estado: false });
  }

  /**
   * Cuenta usuarios por rol
   */
  async countByRol(rol) {
    return await this.userModel.count({
      where: { rol, estado: true }
    });
  }

  /**
   * Actualiza último acceso
   */
  async updateLastAccess(id) {
    return await this.userModel.update(
      { ultimoAcceso: new Date() },
      { where: { id } }
    );
  }
}

module.exports = UserSequelizeRepository;
