const axios = require('axios');
const env = require('../../config/env');
const AppError = require('../../shared/utils/app-error');

/**
 * Servicio de integracion con API de DNI.
 *
 * Se mantiene en backend para no exponer la API key en el bundle del frontend.
 */
class ReniecService {
  constructor() {
    this.apiUrl = env.reniec.apiUrl;
    this.apiKey = env.reniec.apiKey;
  }

  async validarDNI(dni) {
    if (!dni || !/^\d{8}$/.test(dni)) {
      throw new AppError('DNI invalido. Debe tener 8 digitos.', 400);
    }

    if (!this.apiKey) {
      throw new AppError('API de DNI no configurada en el servidor', 503);
    }

    try {
      const response = await axios.get(`${this.apiUrl}/v1/reniec/dni`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          numero: dni
        },
        timeout: 10000
      });

      const normalized = this._normalizeDniResponse(response.data);

      if (!normalized.valido) {
        throw new AppError('DNI no valido o no existe', 400);
      }

      return normalized;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new AppError('DNI no encontrado en el registro', 400);
      }

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new AppError('Servicio de DNI no disponible temporalmente', 503);
      }

      throw error;
    }
  }

  async obtenerInfoPersona(dni) {
    return this.validarDNI(dni);
  }

  _normalizeDniResponse(payload) {
    const data = payload?.data || payload?.persona || payload || {};
    const apellidoPaterno = data.first_last_name || data.apellido_paterno || data.apellidoPaterno || '';
    const apellidoMaterno = data.second_last_name || data.apellido_materno || data.apellidoMaterno || '';
    const nombres = data.first_name || data.nombres || '';
    const nombreCompleto =
      data.full_name ||
      data.nombre_completo ||
      data.nombreCompleto ||
      data.nombre ||
      [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ').trim();

    return {
      valido: Boolean(payload?.success ?? payload?.valido ?? nombreCompleto),
      dni: data.document_number || data.numero || data.dni || data.documento || '',
      nombreCompleto,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      mensaje: payload?.message || payload?.mensaje || 'DNI encontrado'
    };
  }
}

module.exports = ReniecService;
