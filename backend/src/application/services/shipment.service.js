const AppError = require('../../shared/utils/app-error');
const constants = require('../../shared/constants');
const eventEmitter = require('../../shared/events/event-emitter');

/**
 * Servicio de Envíos
 * Orquesta lógica de negocio para operaciones de envíos
 */
class ShipmentService {
  constructor(shipmentRepository, reniecService) {
    this.shipmentRepository = shipmentRepository;
    this.reniecService = reniecService;
  }

  /**
   * Crea un nuevo envío
   * Valida DNIs con RENIEC y emite evento
   */
  async crearEnvio(shipmentData, usuarioId) {
    // Validar datos requeridos
    this._validarDatosEnvio(shipmentData);

    // Validar DNI remitente (con fallback si RENIEC no disponible)
    await this._validarDNI(shipmentData.remitenteDni);
    
    // Validar DNI destinatario
    await this._validarDNI(shipmentData.destinatarioDni);

    // Generar guía
    const guia = `RUT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Crear envío en BD
    const envio = await this.shipmentRepository.create({
      ...shipmentData,
      guia,
      estado: constants.SHIPMENT_STATES.RECIBIDO
    });

    // Emitir evento para notificaciones asincrónicas
    eventEmitter.emit('shipment:created', {
      envioId: envio.id,
      remitenteEmail: shipmentData.remitenteEmail,
      guia,
      codigoTracking: envio.codigoTracking
    });

    return envio;
  }

  /**
   * Obtiene todos los envíos con filtros
   */
  async obtenerEnvios(filters = {}, pagination = {}) {
    return await this.shipmentRepository.findAll(filters, pagination);
  }

  /**
   * Obtiene un envío por ID
   */
  async obtenerEnvioPorId(id) {
    return await this.shipmentRepository.findById(id);
  }

  /**
   * Obtiene un envío por código de tracking
   */
  async obtenerEnvioPublico(codigoTracking) {
    const shipment = await this.shipmentRepository.findByTrackingCode(codigoTracking);
    
    if (!shipment) {
      throw new AppError('Código de tracking no encontrado', 404);
    }

    // Solo retornar información pública (sin email del operario, etc)
    return {
      codigoTracking: shipment.codigoTracking,
      estado: shipment.estado,
      remitenteNombre: shipment.remitenteNombre,
      destinatarioNombre: shipment.destinatarioNombre,
      tipoServicio: shipment.tipoServicio,
      descripcion: shipment.descripcion,
      sucursalOrigen: shipment.sucursalOrigen?.nombre || null,
      sucursalDestino: shipment.sucursalDestino?.nombre || null,
      fechaCreacion: shipment.createdAt,
      fechaUltimoEstado: shipment.updatedAt,
      fechaEntrega: shipment.fechaEntrega
    };
  }

  /**
   * Actualiza el estado de un envío
   * Valida transiciones de estado
   */
  async actualizarEstadoEnvio(id, nuevoEstado, razon = '', operarioId = null) {
    const shipment = await this.shipmentRepository.findById(id);

    if (!shipment) {
      throw new AppError('Envío no encontrado', 404);
    }

    // Validar transición de estado
    this._validarTransicionEstado(shipment.estado, nuevoEstado);

    // Actualizar estado
    const shipmentActualizado = await this.shipmentRepository.updateStatus(
      id,
      nuevoEstado,
      razon,
      operarioId
    );

    // Emitir evento según nuevo estado
    if (nuevoEstado === constants.SHIPMENT_STATES.ENTREGADO) {
      eventEmitter.emit('shipment:delivered', {
        envioId: id,
        destinatarioEmail: shipment.destinatarioEmail,
        destinatarioNombre: shipment.destinatarioNombre
      });
    } else if (nuevoEstado === constants.SHIPMENT_STATES.EN_VIAJE) {
      eventEmitter.emit('shipment:on-way', {
        envioId: id,
        remitenteEmail: shipment.remitenteEmail,
        remitenteNombre: shipment.remitenteNombre
      });
    }

    return shipmentActualizado;
  }

  /**
   * Obtiene el historial de cambios de estado
   */
  async obtenerHistorialEstado(shipmentId) {
    return await this.shipmentRepository.getStatusHistory(shipmentId);
  }

  /**
   * Elimina un envío (solo si está en estado Recibido)
   */
  async eliminarEnvio(id) {
    const shipment = await this.shipmentRepository.findById(id);

    if (!shipment) {
      return null;
    }

    // No permitir eliminar envíos ya enviados
    if (shipment.estado !== constants.SHIPMENT_STATES.RECIBIDO) {
      throw new AppError(
        'Solo se pueden eliminar envíos en estado Recibido',
        400
      );
    }

    // Soft delete
    await this.shipmentRepository.delete(id);

    return true;
  }

  /**
   * Obtiene estadísticas
   */
  async obtenerEstadisticas() {
    return await this.shipmentRepository.getStatsByStatus();
  }

  /**
   * VALIDACIONES PRIVADAS
   */

  /**
   * Valida datos requeridos del envío
   */
  _validarDatosEnvio(shipmentData) {
    const requeridos = [
      'remitenteDni',
      'remitenteNombre',
      'remitenteEmail',
      'destinatarioDni',
      'destinatarioNombre',
      'destinatarioEmail',
      'peso',
      'tipoServicio',
      'sucursalOrigenId',
      'sucursalDestinoId'
    ];

    for (const campo of requeridos) {
      if (!shipmentData[campo]) {
        throw new AppError(`Campo requerido: ${campo}`, 400);
      }
    }

    // Validar que no sean iguales
    if (shipmentData.remitenteDni === shipmentData.destinatarioDni) {
      throw new AppError('Remitente y destinatario no pueden ser la misma persona', 400);
    }
  }

  /**
   * Valida un DNI con RENIEC
   */
  async _validarDNI(dni) {
    if (!dni || dni.length !== 8 || !/^\d+$/.test(dni)) {
      throw new AppError('DNI inválido', 400);
    }

    try {
      await this.reniecService.validarDNI(dni);
    } catch (error) {
      // En desarrollo, permitir si RENIEC no está disponible
      if (process.env.NODE_ENV === 'production') {
        throw new AppError('No se pudo validar el DNI', 400);
      }
      console.warn(`⚠️ RENIEC validation skipped: ${error.message}`);
    }
  }

  /**
   * Valida transiciones de estado
   */
  _validarTransicionEstado(estadoActual, estadoNuevo) {
    const transicionesValidas = {
      [constants.SHIPMENT_STATES.RECIBIDO]: [constants.SHIPMENT_STATES.EN_VIAJE],
      [constants.SHIPMENT_STATES.EN_VIAJE]: [constants.SHIPMENT_STATES.ENTREGADO],
      [constants.SHIPMENT_STATES.ENTREGADO]: [] // Terminal
    };

    const transicionesPermitidas = transicionesValidas[estadoActual] || [];

    if (!transicionesPermitidas.includes(estadoNuevo)) {
      throw new AppError(
        `No se puede cambiar de ${estadoActual} a ${estadoNuevo}`,
        400
      );
    }
  }
}

module.exports = ShipmentService;
