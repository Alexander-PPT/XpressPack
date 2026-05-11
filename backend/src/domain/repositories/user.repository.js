/**
 * Interfaz de Repositorio de Usuario
 * Define contrato que deben cumplir las implementaciones
 */
class IUserRepository {
  /**
   * Busca usuario por ID
   */
  async findById(id) {
    throw new Error('Método no implementado');
  }

  /**
   * Busca usuario por email
   */
  async findByEmail(email) {
    throw new Error('Método no implementado');
  }

  /**
   * Obtiene todos los usuarios
   */
  async findAll(filters = {}) {
    throw new Error('Método no implementado');
  }

  /**
   * Crea nuevo usuario
   */
  async create(usuarioData) {
    throw new Error('Método no implementado');
  }

  /**
   * Actualiza usuario
   */
  async update(id, usuarioData) {
    throw new Error('Método no implementado');
  }

  /**
   * Elimina usuario (suave)
   */
  async delete(id) {
    throw new Error('Método no implementado');
  }
}

module.exports = IUserRepository;
