/**
 * Interfaz de Repositorio de Envío
 * Define contrato para acceso a datos de envíos
 */
class IShipmentRepository {
  /**
   * Busca envío por ID
   */
  async findById(id) {
    throw new Error('Método no implementado');
  }

  /**
   * Busca envío por código de tracking
   */
  async findByTrackingCode(code) {
    throw new Error('Método no implementado');
  }

  /**
   * Busca envío por guía
   */
  async findByGuia(guia) {
    throw new Error('Método no implementado');
  }

  /**
   * Obtiene todos los envíos con filtros
   */
  async findAll(filters = {}, pagination = {}) {
    throw new Error('Método no implementado');
  }

  /**
   * Crea nuevo envío
   */
  async create(shipmentData) {
    throw new Error('Método no implementado');
  }

  /**
   * Actualiza estado del envío
   */
  async updateStatus(id, newStatus) {
    throw new Error('Método no implementado');
  }

  /**
   * Obtiene historial de estados
   */
  async getStatusHistory(shipmentId) {
    throw new Error('Método no implementado');
  }
}

module.exports = IShipmentRepository;
