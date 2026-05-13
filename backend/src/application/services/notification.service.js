const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../../shared/utils/app-error');
const { NOTIFICATION_STATUS, NOTIFICATION_TYPES } = require('../../shared/constants');
const emailTemplates = require('../../shared/templates/email');
const env = require('../../config/env');

/**
 * NotificationService
 * 
 * Responsabilidades:
 * - Crear y gestionar notificaciones
 * - Enviar emails con reintentos
 * - Actualizar estado de notificaciones
 * - Manejo de errores y logging
 * 
 * @class NotificationService
 */
class NotificationService {
  /**
   * Constructor
   * @param {Object} notificationRepository - Repositorio de notificaciones
   */
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
    this.transporter = this._initializeTransporter();
    this.maxRetries = 3;
    this.retryDelays = [60000, 300000, 900000]; // 1min, 5min, 15min
  }

  /**
   * Inicializar transportador de nodemailer
   * @private
   * @returns {Object} Transporter configurado
   */
  _initializeTransporter() {
    if (!env.smtp.host) {
      console.warn('⚠️  SMTP no configurado. Las notificaciones serán logged solamente.');
      return null;
    }

    return nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465, // true para 465, false para otros puertos
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
      from: env.smtp.from || 'noreply@rutasync.com',
    });
  }

  /**
   * Crear notificación de envío creado
   * @param {Object} shipment - Datos del envío
   * @param {Object} recipient - Datos del destinatario
   * @returns {Promise<Object>} Notificación creada
   */
  async notifyShipmentCreated(shipment, recipient) {
    const template = emailTemplates.shipmentCreated({
      codigoTracking: shipment.codigoTracking,
      guia: shipment.guia,
      remitenteNombre: shipment.remitenteNombre,
      destinatarioNombre: shipment.destinatarioNombre,
      tipoServicio: shipment.tipoServicio,
      monto: shipment.monto,
    });

    return this.queueNotification({
      tipo: NOTIFICATION_TYPES.SHIPMENT_CREATED,
      destinatarioEmail: recipient.email,
      asunto: template.subject,
      contenido: template.html,
      envioId: shipment.id,
      usuarioId: null,
    });
  }

  /**
   * Crear notificación de envío en viaje
   * @param {Object} shipment - Datos del envío
   * @param {Object} recipient - Datos del destinatario
   * @returns {Promise<Object>} Notificación creada
   */
  async notifyShipmentOnTheWay(shipment, recipient) {
    const template = emailTemplates.shipmentOnTheWay({
      codigoTracking: shipment.codigoTracking,
      remitenteNombre: shipment.remitenteNombre,
      destinatarioNombre: shipment.destinatarioNombre,
      sucursalOrigen: shipment.sucursalOrigen?.nombre || 'Sucursal origen',
      sucursalDestino: shipment.sucursalDestino?.nombre || 'Sucursal destino',
    });

    return this.queueNotification({
      tipo: NOTIFICATION_TYPES.SHIPMENT_ON_THE_WAY,
      destinatarioEmail: recipient.email,
      asunto: template.subject,
      contenido: template.html,
      envioId: shipment.id,
      usuarioId: null,
    });
  }

  /**
   * Crear notificación de envío entregado
   * @param {Object} shipment - Datos del envío
   * @param {Object} recipient - Datos del destinatario
   * @returns {Promise<Object>} Notificación creada
   */
  async notifyShipmentDelivered(shipment, recipient) {
    const template = emailTemplates.shipmentDelivered({
      codigoTracking: shipment.codigoTracking,
      remitenteNombre: shipment.remitenteNombre,
      destinatarioNombre: shipment.destinatarioNombre,
      fechaEntrega: new Date(shipment.fechaEntrega).toLocaleDateString('es-PE'),
    });

    return this.queueNotification({
      tipo: NOTIFICATION_TYPES.SHIPMENT_DELIVERED,
      destinatarioEmail: recipient.email,
      asunto: template.subject,
      contenido: template.html,
      envioId: shipment.id,
      usuarioId: null,
    });
  }

  /**
   * Encolar notificación para envío
   * @param {Object} notificationData - Datos de la notificación
   * @returns {Promise<Object>} Notificación encolada
   */
  async queueNotification(notificationData) {
    try {
      const notification = {
        id: uuidv4(),
        ...notificationData,
        estado: NOTIFICATION_STATUS.PENDING,
        intentos: 0,
        proximoIntento: new Date(),
        mensajeError: null,
      };

      // Guardar en BD
      const saved = await this.notificationRepository.create(notification);

      // Intentar envío inmediato en background (no esperar)
      setImmediate(() => this.sendNotification(saved.id));

      return saved;
    } catch (error) {
      console.error('❌ Error encolando notificación:', error);
      throw error;
    }
  }

  /**
   * Enviar notificación individual
   * @param {string} notificationId - ID de la notificación
   * @returns {Promise<void>}
   */
  async sendNotification(notificationId) {
    try {
      const notification = await this.notificationRepository.findById(notificationId);
      
      if (!notification) {
        throw new AppError('Notificación no encontrada', 404);
      }

      // Si ya fue enviada exitosamente, no hacer nada
      if (notification.estado === NOTIFICATION_STATUS.SENT) {
        return;
      }

      // Verificar si hay que reintentar
      if (notification.intentos >= this.maxRetries) {
        await this.notificationRepository.update(notificationId, {
          estado: NOTIFICATION_STATUS.FAILED,
          mensajeError: `Máximo número de intentos (${this.maxRetries}) alcanzado`,
        });
        return;
      }

      // Enviar email
      if (this.transporter) {
        try {
          await this._sendEmail(
            notification.destinatarioEmail,
            notification.asunto,
            notification.contenido
          );
        } catch (emailError) {
          // Email fallo, programar reintento
          const nextRetryIndex = notification.intentos;
          const nextRetryTime = new Date(
            Date.now() + this.retryDelays[nextRetryIndex]
          );

          await this.notificationRepository.update(notificationId, {
            intentos: notification.intentos + 1,
            proximoIntento: nextRetryTime,
            mensajeError: emailError.message,
          });

          console.warn(
            `⚠️  Reintentaré notificación ${notificationId} en ${nextRetryTime.toISOString()}`
          );
          return;
        }
      } else {
        // SMTP no configurado, loguear solamente
        console.log(`📧 [SIMULATED EMAIL] To: ${notification.destinatarioEmail}`);
        console.log(`📧 [SIMULATED EMAIL] Subject: ${notification.asunto}`);
      }

      // Marcar como enviada
      await this.notificationRepository.update(notificationId, {
        estado: NOTIFICATION_STATUS.SENT,
        intentos: notification.intentos + 1,
        mensajeError: null,
      });

      console.log(`✅ Notificación ${notificationId} enviada exitosamente`);
    } catch (error) {
      console.error(`❌ Error enviando notificación ${notificationId}:`, error);

      // Guardar error si es posible
      try {
        const notification = await this.notificationRepository.findById(notificationId);
        if (notification && notification.intentos < this.maxRetries) {
          const nextRetryTime = new Date(
            Date.now() + this.retryDelays[notification.intentos]
          );
          await this.notificationRepository.update(notificationId, {
            intentos: notification.intentos + 1,
            proximoIntento: nextRetryTime,
            mensajeError: error.message,
          });
        }
      } catch (updateError) {
        console.error('Error actualizando notificación fallida:', updateError);
      }
    }
  }

  /**
   * Enviar email usando nodemailer
   * @private
   * @param {string} to - Email destinatario
   * @param {string} subject - Asunto
   * @param {string} html - Contenido HTML
   * @returns {Promise<void>}
   */
  async _sendEmail(to, subject, html) {
    if (!this.transporter) {
      throw new Error('SMTP no configurado');
    }

    return this.transporter.sendMail({
      from: env.smtp.from || 'noreply@rutasync.com',
      to,
      subject,
      html,
      text: this._stripHtml(html), // Versión plain text
    });
  }

  /**
   * Remover tags HTML
   * @private
   * @param {string} html - HTML a convertir
   * @returns {string} Texto plano
   */
  _stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  }

  /**
   * Obtener notificaciones de un envío
   * @param {string} envioId - ID del envío
   * @returns {Promise<Array>} Array de notificaciones
   */
  async getShipmentNotifications(envioId) {
    return this.notificationRepository.findByShipmentId(envioId);
  }

  /**
   * Obtener notificaciones pendientes de reintento
   * @returns {Promise<Array>} Array de notificaciones pendientes
   */
  async getPendingRetries() {
    return this.notificationRepository.findPendingRetries();
  }

  /**
   * Procesar reintentos pendientes
   * @returns {Promise<void>}
   */
  async processPendingRetries() {
    try {
      const pending = await this.getPendingRetries();
      
      console.log(`🔄 Procesando ${pending.length} notificaciones pendientes...`);
      
      for (const notification of pending) {
        // Procesar en paralelo pero con límite
        await this.sendNotification(notification.id);
      }
    } catch (error) {
      console.error('❌ Error procesando reintentos:', error);
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   * @returns {Promise<Object>} Estadísticas
   */
  async getStatistics() {
    return this.notificationRepository.getStatistics();
  }
}

module.exports = NotificationService;
