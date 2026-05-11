const AppError = require('../../shared/utils/app-error');
const constants = require('../../shared/constants');

class SucursalService {
  constructor(sucursalRepository) {
    this.sucursalRepository = sucursalRepository;
  }

  async createSucursal(data) {
    const existing = await this.sucursalRepository.findByCodigo(data.codigo);

    if (existing) {
      throw new AppError('Codigo de sucursal ya registrado', constants.HTTP.CONFLICT);
    }

    return await this.sucursalRepository.create(data);
  }

  async getSucursales(filters = {}) {
    return await this.sucursalRepository.findAll(filters);
  }

  async getSucursalById(id) {
    return await this.sucursalRepository.findById(id);
  }

  async updateSucursal(id, data) {
    return await this.sucursalRepository.update(id, data);
  }

  async deactivateSucursal(id) {
    return await this.sucursalRepository.delete(id);
  }

  async activateSucursal(id) {
    return await this.sucursalRepository.update(id, { estado: true });
  }
}

module.exports = SucursalService;
