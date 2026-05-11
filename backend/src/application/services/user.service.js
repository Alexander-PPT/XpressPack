const bcrypt = require('bcryptjs');
const AppError = require('../../shared/utils/app-error');
const constants = require('../../shared/constants');

class UserService {
  constructor(userRepository, sucursalRepository) {
    this.userRepository = userRepository;
    this.sucursalRepository = sucursalRepository;
  }

  async createUser(data) {
    const { email, password, rol, sucursalId } = data;

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('Email ya registrado', constants.HTTP.CONFLICT);
    }

    if (rol === constants.ROLES.OPERARIO && !sucursalId) {
      throw new AppError('Operario debe tener sucursal asignada', constants.HTTP.BAD_REQUEST);
    }

    if (sucursalId) {
      const sucursal = await this.sucursalRepository.findById(sucursalId);
      if (!sucursal) {
        throw new AppError('Sucursal no encontrada', constants.HTTP.NOT_FOUND);
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await this.userRepository.create({
      ...data,
      passwordHash
    });

    return await this.userRepository.findById(created.id);
  }

  async getUsers(filters = {}) {
    return await this.userRepository.findAll(filters);
  }

  async getUserById(id) {
    return await this.userRepository.findById(id);
  }

  async updateUser(id, data) {
    if (data.rol === constants.ROLES.OPERARIO && !data.sucursalId) {
      throw new AppError('Operario debe tener sucursal asignada', constants.HTTP.BAD_REQUEST);
    }

    if (data.sucursalId) {
      const sucursal = await this.sucursalRepository.findById(data.sucursalId);
      if (!sucursal) {
        throw new AppError('Sucursal no encontrada', constants.HTTP.NOT_FOUND);
      }
    }

    const updated = await this.userRepository.update(id, data);

    if (!updated) {
      return null;
    }

    return await this.userRepository.findById(id);
  }

  async deactivateUser(id) {
    return await this.userRepository.delete(id);
  }

  async activateUser(id) {
    const updated = await this.userRepository.update(id, { estado: true });

    if (!updated) {
      return null;
    }

    return await this.userRepository.findById(id);
  }
}

module.exports = UserService;
