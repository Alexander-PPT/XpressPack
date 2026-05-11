const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

/**
 * Implementación del Repositorio de Envío con Sequelize
 * Acceso a datos para entidad Envío
 */
class ShipmentSequelizeRepository {
  constructor(shipmentModel, historialEstadoModel) {
    this.shipmentModel = shipmentModel;
    this.historialEstadoModel = historialEstadoModel;
  }

  /**
   * Busca envío por ID
   */
  async findById(id) {
    return await this.shipmentModel.findByPk(id);
  }

  /**
   * Busca envío por código de tracking
   */
  async findByTrackingCode(code) {
    return await this.shipmentModel.findOne({
      where: { codigoTracking: code },
      include: [
        { model: this.shipmentModel.sequelize.models.Sucursal, as: 'sucursalOrigen' },
        { model: this.shipmentModel.sequelize.models.Sucursal, as: 'sucursalDestino' }
      ]
    });
  }

  /**
   * Busca envío por guía
   */
  async findByGuia(guia) {
    return await this.shipmentModel.findOne({
      where: { guia }
    });
  }

  /**
   * Obtiene todos los envíos con filtros y paginación
   */
  async findAll(filters = {}, pagination = { page: 1, pageSize: 10 }) {
    const where = this._buildWhere(filters);

    const offset = (pagination.page - 1) * pagination.pageSize;

    const { count, rows } = await this.shipmentModel.findAndCountAll({
      where,
      limit: pagination.pageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      data: rows,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems: count,
        totalPages: Math.ceil(count / pagination.pageSize)
      }
    };
  }

  /**
   * Obtiene envios para reportes (sin paginacion)
   */
  async findAllForReport(filters = {}) {
    const where = this._buildWhere(filters);

    return await this.shipmentModel.findAll({
      where,
      include: [
        { model: this.shipmentModel.sequelize.models.Sucursal, as: 'sucursalOrigen' },
        { model: this.shipmentModel.sequelize.models.Sucursal, as: 'sucursalDestino' }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Crea nuevo envío
   */
  async create(shipmentData) {
    // Generar código de tracking único
    shipmentData.codigoTracking = shipmentData.codigoTracking || this._generarCodigoTracking();
    
    const shipment = await this.shipmentModel.create(shipmentData);

    // Registrar estado inicial en historial
    await this.historialEstadoModel.create({
      envioId: shipment.id,
      estadoAnterior: null,
      estadoNuevo: 'Recibido',
      razon: 'Envío creado en el sistema'
    });

    return shipment;
  }

  /**
   * Actualiza estado del envío
   */
  async updateStatus(id, newStatus, razon = '', operarioId = null) {
    const shipment = await this.shipmentModel.findByPk(id);
    
    if (!shipment) {
      return null;
    }

    const oldStatus = shipment.estado;

    // Actualizar envío
    await shipment.update({
      estado: newStatus,
      ...(newStatus === 'Entregado' && { fechaEntrega: new Date() })
    });

    // Registrar en historial
    await this.historialEstadoModel.create({
      envioId: id,
      estadoAnterior: oldStatus,
      estadoNuevo: newStatus,
      razon,
      operarioId
    });

    return shipment;
  }

  /**
   * Obtiene historial de cambios de estado
   */
  async getStatusHistory(shipmentId) {
    return await this.historialEstadoModel.findAll({
      where: { envioId: shipmentId },
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Genera código de tracking único
   */
  _generarCodigoTracking() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${timestamp}${random}`;
  }

  /**
   * Obtiene envíos pendientes de entrega
   */
  async findPendingDeliveries(sucursalDestinoId) {
    return await this.shipmentModel.findAll({
      where: {
        estado: 'En Viaje',
        sucursalDestinoId
      },
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Obtiene estadísticas por estado
   */
  async getStatsByStatus() {
    const estados = ['Recibido', 'En Viaje', 'Entregado'];
    const stats = {};

    for (const estado of estados) {
      stats[estado] = await this.shipmentModel.count({
        where: { estado }
      });
    }

    return stats;
  }

  _buildWhere(filters = {}) {
    const where = {};

    if (filters.estado) where.estado = filters.estado;
    if (filters.remitenteDni) where.remitenteDni = filters.remitenteDni;
    if (filters.destinatarioDni) where.destinatarioDni = filters.destinatarioDni;
    if (filters.sucursalOrigenId) where.sucursalOrigenId = filters.sucursalOrigenId;
    if (filters.sucursalDestinoId) where.sucursalDestinoId = filters.sucursalDestinoId;
    if (filters.tipoServicio) where.tipoServicio = filters.tipoServicio;

    if (filters.fechaDesde || filters.fechaHasta) {
      where.createdAt = {};

      if (filters.fechaDesde) {
        where.createdAt[Op.gte] = new Date(filters.fechaDesde);
      }

      if (filters.fechaHasta) {
        where.createdAt[Op.lte] = new Date(filters.fechaHasta);
      }
    }

    return where;
  }
}

module.exports = ShipmentSequelizeRepository;
