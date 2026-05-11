/**
 * Email Templates para RutaSync
 * 
 * Todas las plantillas incluyen:
 * - Estilos inline (sin dependencias CSS)
 * - Responsive design
 * - Branding de RutaSync
 * - Footer con información de contacto
 */

const shipmentCreated = (data) => ({
  subject: `🎉 Tu envío ha sido registrado - Código: ${data.codigoTracking}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      
      <!-- Contenedor Principal -->
      <table style="width: 100%; background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center" style="padding: 20px;">
            
            <!-- Email Container -->
            <table style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
              
              <!-- Header con Logo -->
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <td style="padding: 30px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🚚 RutaSync</h1>
                  <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Sistema de Seguimiento de Envíos</p>
                </td>
              </tr>

              <!-- Contenido Principal -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <!-- Título -->
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: bold;">
                    ¡Tu envío ha sido registrado! 🎉
                  </h2>

                  <!-- Mensaje -->
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Hola <strong>${data.remitenteNombre}</strong>,
                  </p>

                  <p style="margin: 0 0 25px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                    Tu envío ha sido registrado exitosamente en nuestro sistema. Aquí están los detalles:
                  </p>

                  <!-- Tarjeta de Información -->
                  <table style="width: 100%; margin-bottom: 25px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea; overflow: hidden;">
                    <tr>
                      <td style="padding: 20px;">
                        
                        <!-- Código de Tracking -->
                        <div style="margin-bottom: 15px;">
                          <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase;">Código de Tracking</p>
                          <p style="margin: 0; color: #333333; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace;">${data.codigoTracking}</p>
                        </div>

                        <!-- Guía -->
                        <div style="margin-bottom: 15px;">
                          <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase;">Número de Guía</p>
                          <p style="margin: 0; color: #333333; font-size: 16px; font-family: 'Courier New', monospace;">${data.guia}</p>
                        </div>

                        <!-- Remitente -->
                        <div style="margin-bottom: 15px;">
                          <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase;">Remitente</p>
                          <p style="margin: 0; color: #333333; font-size: 15px;">${data.remitenteNombre}</p>
                        </div>

                        <!-- Destinatario -->
                        <div style="margin-bottom: 15px;">
                          <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase;">Destinatario</p>
                          <p style="margin: 0; color: #333333; font-size: 15px;">${data.destinatarioNombre}</p>
                        </div>

                        <!-- Tipo de Servicio -->
                        <div style="margin-bottom: 0;">
                          <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase;">Tipo de Servicio</p>
                          <p style="margin: 0; color: #333333; font-size: 15px;">${data.tipoServicio}</p>
                        </div>

                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table style="width: 100%; margin-bottom: 25px;">
                    <tr>
                      <td align="center">
                        <a href="https://rutasync.app/tracking/${data.codigoTracking}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
                          📍 Rastrear mi Envío
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Info -->
                  <p style="margin: 0 0 15px 0; color: #999999; font-size: 13px; line-height: 1.6;">
                    Puedes rastrear el estado de tu envío en cualquier momento usando el código de tracking: <strong>${data.codigoTracking}</strong>
                  </p>

                </td>
              </tr>

              <!-- Footer -->
              <tr style="background-color: #f8f9fa; border-top: 1px solid #eeeeee;">
                <td style="padding: 25px 30px; text-align: center; color: #999999; font-size: 13px;">
                  <p style="margin: 0 0 10px 0;">
                    <strong>RutaSync - Sistema de Seguimiento de Envíos</strong>
                  </p>
                  <p style="margin: 0 0 10px 0;">
                    📧 contacto@rutasync.com | 📞 +51 1 9999-9999
                  </p>
                  <p style="margin: 0; color: #cccccc; font-size: 12px;">
                    Este es un correo automático. Por favor no responder a este mensaje.
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `,
});

const shipmentOnTheWay = (data) => ({
  subject: `🚀 Tu envío está en camino - ${data.codigoTracking}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      
      <table style="width: 100%; background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center" style="padding: 20px;">
            
            <table style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
              
              <!-- Header -->
              <tr style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <td style="padding: 30px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🚀 Tu envío está en camino</h1>
                </td>
              </tr>

              <!-- Contenido -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px; font-weight: bold;">
                    ¡Buenas noticias! 📍
                  </h2>

                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                    Hola <strong>${data.destinatarioNombre}</strong>,
                  </p>

                  <p style="margin: 0 0 25px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                    Tu envío ha sido despachado de nuestra sucursal y está en camino hacia ti.
                  </p>

                  <!-- Timeline -->
                  <table style="width: 100%; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 15px; background-color: #f0f4ff; border-radius: 6px; border-left: 4px solid #f5576c;">
                        <div style="display: flex; margin-bottom: 15px;">
                          <div style="color: #f5576c; font-weight: bold; margin-right: 15px;">📦</div>
                          <div>
                            <p style="margin: 0 0 3px 0; color: #333333; font-weight: bold; font-size: 14px;">Origen</p>
                            <p style="margin: 0; color: #666666; font-size: 13px;">${data.sucursalOrigen}</p>
                          </div>
                        </div>
                        <div style="text-align: center; color: #f5576c; margin-bottom: 15px;">↓</div>
                        <div style="display: flex;">
                          <div style="color: #f5576c; font-weight: bold; margin-right: 15px;">🎯</div>
                          <div>
                            <p style="margin: 0 0 3px 0; color: #333333; font-weight: bold; font-size: 14px;">Destino</p>
                            <p style="margin: 0; color: #666666; font-size: 13px;">${data.sucursalDestino}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Código de Tracking -->
                  <table style="width: 100%; margin-bottom: 25px; background-color: #f8f9fa; border-radius: 6px; padding: 15px;">
                    <tr>
                      <td>
                        <p style="margin: 0 0 8px 0; color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase;">Código de Tracking</p>
                        <p style="margin: 0; color: #f5576c; font-size: 20px; font-weight: bold; font-family: 'Courier New', monospace;">${data.codigoTracking}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table style="width: 100%; margin-bottom: 25px;">
                    <tr>
                      <td align="center">
                        <a href="https://rutasync.app/tracking/${data.codigoTracking}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
                          📍 Ver Detalles
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr style="background-color: #f8f9fa; border-top: 1px solid #eeeeee;">
                <td style="padding: 25px 30px; text-align: center; color: #999999; font-size: 13px;">
                  <p style="margin: 0 0 10px 0;">
                    <strong>RutaSync - Sistema de Seguimiento de Envíos</strong>
                  </p>
                  <p style="margin: 0; color: #cccccc; font-size: 12px;">
                    Rastreo automático desde nuestras sucursales
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `,
});

const shipmentDelivered = (data) => ({
  subject: `✅ Tu envío ha sido entregado - ${data.codigoTracking}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      
      <table style="width: 100%; background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center" style="padding: 20px;">
            
            <table style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
              
              <!-- Header Success -->
              <tr style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
                <td style="padding: 30px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold;">✅ ¡Entregado!</h1>
                  <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Tu envío ha sido entregado exitosamente</p>
                </td>
              </tr>

              <!-- Contenido -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px; font-weight: bold;">
                    ¡Tu envío ha llegado! 🎉
                  </h2>

                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                    Hola <strong>${data.destinatarioNombre}</strong>,
                  </p>

                  <p style="margin: 0 0 25px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                    Tu envío fue entregado exitosamente el <strong>${data.fechaEntrega}</strong>. Esperamos que llegue en perfectas condiciones.
                  </p>

                  <!-- Success Card -->
                  <table style="width: 100%; margin-bottom: 25px; background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); border-radius: 6px; border-left: 4px solid #38ef7d; overflow: hidden;">
                    <tr>
                      <td style="padding: 20px;">
                        
                        <div style="text-align: center; margin-bottom: 15px;">
                          <span style="font-size: 48px;">✅</span>
                        </div>

                        <div style="margin-bottom: 15px;">
                          <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase;">Remitente</p>
                          <p style="margin: 0; color: #333333; font-size: 15px;">${data.remitenteNombre}</p>
                        </div>

                        <div style="margin-bottom: 15px;">
                          <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase;">Entregado a</p>
                          <p style="margin: 0; color: #333333; font-size: 15px;">${data.destinatarioNombre}</p>
                        </div>

                        <div style="margin-bottom: 0;">
                          <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase;">Fecha y Hora</p>
                          <p style="margin: 0; color: #333333; font-size: 15px;">${data.fechaEntrega}</p>
                        </div>

                      </td>
                    </tr>
                  </table>

                  <!-- Código de Tracking -->
                  <table style="width: 100%; margin-bottom: 25px; background-color: #f8f9fa; border-radius: 6px; padding: 15px;">
                    <tr>
                      <td>
                        <p style="margin: 0 0 8px 0; color: #999999; font-size: 12px; font-weight: bold; text-transform: uppercase;">Código de Tracking</p>
                        <p style="margin: 0; color: #38ef7d; font-size: 20px; font-weight: bold; font-family: 'Courier New', monospace;">${data.codigoTracking}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Encuesta -->
                  <p style="margin: 0 0 15px 0; color: #666666; font-size: 13px; text-align: center;">
                    ¿Cómo fue tu experiencia? <a href="https://rutasync.app/feedback/${data.codigoTracking}" style="color: #38ef7d; text-decoration: none; font-weight: bold;">Déjanos tu opinión</a>
                  </p>

                </td>
              </tr>

              <!-- Footer -->
              <tr style="background-color: #f8f9fa; border-top: 1px solid #eeeeee;">
                <td style="padding: 25px 30px; text-align: center; color: #999999; font-size: 13px;">
                  <p style="margin: 0 0 10px 0;">
                    <strong>RutaSync - Sistema de Seguimiento de Envíos</strong>
                  </p>
                  <p style="margin: 0; color: #cccccc; font-size: 12px;">
                    Gracias por confiar en nosotros
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `,
});

module.exports = {
  shipmentCreated,
  shipmentOnTheWay,
  shipmentDelivered,
};
