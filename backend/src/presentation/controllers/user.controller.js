const AppError = require('../../shared/utils/app-error');
const asyncHandler = require('../../shared/utils/async-handler');
const constants = require('../../shared/constants');

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  create = asyncHandler(async (req, res) => {
    const user = await this.userService.createUser(req.body);

    res.status(constants.HTTP.CREATED).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: user
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const { rol, estado, sucursalId } = req.query;
    const filters = {};

    if (rol) filters.rol = rol;
    if (estado !== undefined) filters.estado = estado === 'true';
    if (sucursalId) filters.sucursalId = sucursalId;

    const users = await this.userService.getUsers(filters);

    res.status(constants.HTTP.OK).json({
      success: true,
      data: users
    });
  });

  getById = asyncHandler(async (req, res) => {
    const user = await this.userService.getUserById(req.params.id);

    if (!user) {
      throw new AppError('Usuario no encontrado', constants.HTTP.NOT_FOUND);
    }

    res.status(constants.HTTP.OK).json({
      success: true,
      data: user
    });
  });

  update = asyncHandler(async (req, res) => {
    const user = await this.userService.updateUser(req.params.id, req.body);

    if (!user) {
      throw new AppError('Usuario no encontrado', constants.HTTP.NOT_FOUND);
    }

    res.status(constants.HTTP.OK).json({
      success: true,
      message: 'Usuario actualizado',
      data: user
    });
  });

  deactivate = asyncHandler(async (req, res) => {
    const user = await this.userService.deactivateUser(req.params.id);

    if (!user) {
      throw new AppError('Usuario no encontrado', constants.HTTP.NOT_FOUND);
    }

    res.status(constants.HTTP.OK).json({
      success: true,
      message: 'Usuario desactivado'
    });
  });

  activate = asyncHandler(async (req, res) => {
    const user = await this.userService.activateUser(req.params.id);

    if (!user) {
      throw new AppError('Usuario no encontrado', constants.HTTP.NOT_FOUND);
    }

    res.status(constants.HTTP.OK).json({
      success: true,
      message: 'Usuario activado'
    });
  });
}

module.exports = UserController;
