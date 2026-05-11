const axios = require('axios');
const env = require('../../config/env');
const AppError = require('../../shared/utils/app-error');

/**
 * Servicio de integración con RENIEC
 * Valida DNIs contra la API del RENIEC
 */
class ReniecService {
  constructor() {
    this.apiUrl = env.reniec.apiUrl;
    this.apiKey = env.reniec.apiKey;
  }

  /**
   * Valida un DNI contra RENIEC
   */
  async validarDNI(dni) {
    // En desarrollo o sin API key, saltear validación
    if (!this.apiKey || process.env.NODE_ENV === 'development') {
      return {
        valido: true,
        nombre: 'Usuario de Prueba',
        mensaje: 'Validación de RENIEC deshabilitada en desarrollo'
      };
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/dni/${dni}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 segundos
        }
      );

      if (!response.data || !response.data.valido) {
        throw new AppError('DNI no válido o no existe', 400);
      }

      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new AppError('DNI no encontrado en RENIEC', 400);
      }

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        // En producción, reintento; en desarrollo, permitir
        if (process.env.NODE_ENV === 'production') {
          throw new AppError('Servicio RENIEC no disponible temporalmente', 503);
        }
        return { valido: true, nombre: 'Fallback' };
      }

      throw error;
    }
  }

  /**
   * Obtiene información de una persona por DNI
   */
  async obtenerInfoPersona(dni) {
    const datosValidos = await this.validarDNI(dni);
    return datosValidos;
  }
}

module.exports = ReniecService;
