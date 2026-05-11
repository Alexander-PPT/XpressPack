const { v4: uuidv4 } = require('uuid');
const { NOTIFICATION_STATUS } = require('../../shared/constants');

/**
 * NotificationSequelizeRepository
 * 
 * Implementación del repositorio de notificaciones usando Sequelize ORM
 * 
 * Responsabilidades:
 * - Persistencia de notificaciones
 * - Queries de búsqueda y filtrado
 * - Actualizaciones de estado y reintentos
 * 
 * @class NotificationSequelizeRepository
 */
class NotificationSequelizeRepository {
  /**
   * Constructor
   * @param {Model} Notificacion - Modelo Sequelize de Notificación
   */
  constructor(Notificacion) {
    this.Notificacion = Notificacion;
  }

  /**
   * Crear una nueva notificación
   * @param {Object} data - Datos de la notificación
   * @returns {Promise<Object>} Notificación creada
   */
  async create(data) {
    try {
      const notification = await this.Notificacion.create({
        id: data.id || uuidv4(),
        tipo: data.tipo,
        destinatarioEmail: data.destinatarioEmail,
        asunto: data.asunto,
        contenido: data.contenido,
        envioId: data.envioId || null,
        usuarioId: data.usuarioId || null,
        estado: data.estado || NOTIFICATION_STATUS.PENDING,
        mensajeError: data.mensajeError || null,
        intentos: data.intentos || 0,
        proximoIntento: data.proximoIntento || new Date(),
      });

      return notification.toJSON();
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  /**
   * Obtener notificación por ID
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object|null>} Notificación o null
   */
  async findById(id) {
    try {
      const notification = await this.Notificacion.findByPk(id);
      return notification ? notification.toJSON() : null;
    } catch (error) {
      console.error('Error obteniendo notificación:', error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones por ID de envío
   * @param {string} envioId - ID del envío
   * @returns {Promise<Array>} Array de notificaciones
   */
  async findByShipmentId(envioId) {
    try {
      const notifications = await this.Notificacion.findAll({
        where: { envioId },
        order: [['createdAt', 'DESC']],
      });

      return notifications.map(n => n.toJSON());
    } catch (error) {
      console.error('Error obteniendo notificaciones por envío:', error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones pendientes de reintento
   * @returns {Promise<Array>} Array de notificaciones pendientes
   */
  async findPendingRetries() {
    try {
      const now = new Date();

      const notifications = await this.Notificacion.findAll({
        where: {
          estado: NOTIFICATION_STATUS.PENDING,
          proximoIntento: {
            [this.Notificacion.sequelize.Sequelize.Op.lte]: now,
          },
          intentos: {
            [this.Notificacion.sequelize.Sequelize.Op.lt]: 3,
          },
        },
        order: [['proximoIntento', 'ASC']],
        limit: 10, // Procesar máximo 10 en cada ciclo
      });

      return notifications.map(n => n.toJSON());
    } catch (error) {
      console.error('Error obteniendo notificaciones pendientes:', error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones por estado
   * @param {string} estado - Estado de notificación
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Array de notificaciones
   */
  async findByStatus(estado, limit = 100) {
    try {
      const notifications = await this.Notificacion.findAll({
        where: { estado },
        order: [['createdAt', 'DESC']],
        limit,
      });

      return notifications.map(n => n.toJSON());
    } catch (error) {
      console.error('Error obteniendo notificaciones por estado:', error);
      throw error;
    }
  }

  /**
   * Actualizar notificación
   * @param {string} id - ID de la notificación
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Notificación actualizada
   */
  async update(id, updateData) {
    try {
      const notification = await this.Notificacion.findByPk(id);

      if (!notification) {
        return null;
      }

      await notification.update(updateData);
      return notification.toJSON();
    } catch (error) {
      console.error('Error actualizando notificación:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como enviada
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object>} Notificación actualizada
   */
  async markAsSent(id) {
    return this.update(id, {
      estado: NOTIFICATION_STATUS.SENT,
      mensajeError: null,
    });
  }

  /**
   * Marcar notificación como fallida
   * @param {string} id - ID de la notificación
   * @param {string} errorMessage - Mensaje de error
   * @returns {Promise<Object>} Notificación actualizada
   */
  async markAsFailed(id, errorMessage) {
    return this.update(id, {
      estado: NOTIFICATION_STATUS.FAILED,
      mensajeError: errorMessage,
    });
  }

  /**
   * Obtener estadísticas de notificaciones
   * @returns {Promise<Object>} Estadísticas
   */
  async getStatistics() {
    try {
      const total = await this.Notificacion.count();

      const byStatus = await this.Notificacion.findAll({
        attributes: [
          'estado',
          [this.Notificacion.sequelize.Sequelize.fn('COUNT', this.Notificacion.sequelize.Sequelize.col('id')), 'count'],
        ],
        group: ['estado'],
        raw: true,
      });

      const stats = {
        total,
        byStatus: {},
      };

      byStatus.forEach(item => {
        stats.byStatus[item.estado] = parseInt(item.count, 10);
      });

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las notificaciones con filtros
   * @param {Object} filters - Filtros a aplicar
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Resultado paginado
   */
  async findAll(filters = {}, pagination = {}) {
    try {
      const { page = 1, pageSize = 20 } = pagination;
      const where = {};

      // Aplicar filtros
      if (filters.estado) {
        where.estado = filters.estado;
      }

      if (filters.envioId) {
        where.envioId = filters.envioId;
      }

      if (filters.tipo) {
        where.tipo = filters.tipo;
      }

      // Paginación
      const offset = (page - 1) * pageSize;

      const { count, rows } = await this.Notificacion.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        order: [['createdAt', 'DESC']],
      });

      return {
        data: rows.map(n => n.toJSON()),
        pagination: {
          page,
          pageSize,
          totalItems: count,
          totalPages: Math.ceil(count / pageSize),
        },
      };
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  /**
   * Eliminar notificación (soft delete)
   * @param {string} id - ID de la notificación
   * @returns {Promise<boolean>} True si fue eliminada
   */
  async delete(id) {
    try {
      const result = await this.Notificacion.destroy({
        where: { id },
      });

      return result > 0;
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      throw error;
    }
  }

  /**
   * Limpiar notificaciones antiguas (más de 90 días)
   * @returns {Promise<number>} Cantidad de registros eliminados
   */
  async cleanupOldNotifications() {
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      const result = await this.Notificacion.destroy({
        where: {
          createdAt: {
            [this.Notificacion.sequelize.Sequelize.Op.lt]: ninetyDaysAgo,
          },
          estado: NOTIFICATION_STATUS.SENT, // Solo limpiar notificaciones enviadas
        },
      });

      console.log(`🧹 Limpiadas ${result} notificaciones antiguas`);
      return result;
    } catch (error) {
      console.error('Error limpiando notificaciones antiguas:', error);
      throw error;
    }
  }
}

module.exports = NotificationSequelizeRepository;
