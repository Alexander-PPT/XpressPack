const eventEmitter = require('./event-emitter');

/**
 * Configurar los listeners de eventos para notificaciones
 * 
 * Este módulo escucha eventos de envíos y dispara notificaciones
 * correspondientes usando el NotificationService
 * 
 * @param {Object} notificationService - Instancia del servicio de notificaciones
 * @param {Object} shipmentRepository - Repositorio de envíos
 */
function setupNotificationListeners(notificationService, shipmentRepository) {
  
  /**
   * Listener: shipment:created
   * Se dispara cuando se crea un nuevo envío
   */
  eventEmitter.on('shipment:created', async (shipmentData) => {
    try {
      console.log('📧 Evento: shipment:created - Enviando notificaciones...');

      // Obtener datos completos del envío
      const shipment = await shipmentRepository.findById(shipmentData.id);
      
      if (!shipment) {
        console.warn(`⚠️  Envío ${shipmentData.id} no encontrado para notificación`);
        return;
      }

      // Notificar al remitente
      await notificationService.notifyShipmentCreated(shipment, {
        email: shipment.remitenteEmail,
      });

      console.log(`✅ Notificación enviada al remitente: ${shipment.remitenteEmail}`);
    } catch (error) {
      console.error('❌ Error procesando evento shipment:created:', error);
    }
  });

  /**
   * Listener: shipment:on-way
   * Se dispara cuando un envío cambia a estado "En Viaje"
   */
  eventEmitter.on('shipment:on-way', async (shipmentData) => {
    try {
      console.log('📧 Evento: shipment:on-way - Enviando notificaciones...');

      // Obtener datos completos del envío
      const shipment = await shipmentRepository.findById(shipmentData.id);
      
      if (!shipment) {
        console.warn(`⚠️  Envío ${shipmentData.id} no encontrado para notificación`);
        return;
      }

      // Notificar al destinatario
      await notificationService.notifyShipmentOnTheWay(shipment, {
        email: shipment.destinatarioEmail,
      });

      console.log(`✅ Notificación enviada al destinatario: ${shipment.destinatarioEmail}`);
    } catch (error) {
      console.error('❌ Error procesando evento shipment:on-way:', error);
    }
  });

  /**
   * Listener: shipment:delivered
   * Se dispara cuando un envío es entregado (estado "Entregado")
   */
  eventEmitter.on('shipment:delivered', async (shipmentData) => {
    try {
      console.log('📧 Evento: shipment:delivered - Enviando notificaciones...');

      // Obtener datos completos del envío
      const shipment = await shipmentRepository.findById(shipmentData.id);
      
      if (!shipment) {
        console.warn(`⚠️  Envío ${shipmentData.id} no encontrado para notificación`);
        return;
      }

      // Notificar al destinatario
      await notificationService.notifyShipmentDelivered(shipment, {
        email: shipment.destinatarioEmail,
      });

      // También notificar al remitente
      await notificationService.notifyShipmentDelivered(shipment, {
        email: shipment.remitenteEmail,
      });

      console.log(`✅ Notificaciones de entrega enviadas`);
    } catch (error) {
      console.error('❌ Error procesando evento shipment:delivered:', error);
    }
  });

  console.log('🎧 Event listeners de notificaciones configurados');
}

/**
 * Remover listeners (para testing o cleanup)
 */
function removeNotificationListeners() {
  eventEmitter.removeAllListeners('shipment:created');
  eventEmitter.removeAllListeners('shipment:on-way');
  eventEmitter.removeAllListeners('shipment:delivered');
  console.log('🗑️  Event listeners de notificaciones removidos');
}

module.exports = {
  setupNotificationListeners,
  removeNotificationListeners,
};
