const AppError = require('../../shared/utils/app-error');
const asyncHandler = require('../../shared/utils/async-handler');
const constants = require('../../shared/constants');

class SucursalController {
  constructor(sucursalService) {
    this.sucursalService = sucursalService;
  }

  create = asyncHandler(async (req, res) => {
    const sucursal = await this.sucursalService.createSucursal(req.body);

    res.status(constants.HTTP.CREATED).json({
      success: true,
      message: 'Sucursal creada exitosamente',
      data: sucursal
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const { estado, ciudad, departamento } = req.query;
    const filters = {};

    if (estado !== undefined) filters.estado = estado === 'true';
    if (ciudad) filters.ciudad = ciudad;
    if (departamento) filters.departamento = departamento;

    const sucursales = await this.sucursalService.getSucursales(filters);

    res.status(constants.HTTP.OK).json({
      success: true,
      data: sucursales
    });
  });

  getById = asyncHandler(async (req, res) => {
    const sucursal = await this.sucursalService.getSucursalById(req.params.id);

    if (!sucursal) {
      throw new AppError('Sucursal no encontrada', constants.HTTP.NOT_FOUND);
    }

    res.status(constants.HTTP.OK).json({
      success: true,
      data: sucursal
    });
  });

  update = asyncHandler(async (req, res) => {
    const sucursal = await this.sucursalService.updateSucursal(req.params.id, req.body);

    if (!sucursal) {
      throw new AppError('Sucursal no encontrada', constants.HTTP.NOT_FOUND);
    }

    res.status(constants.HTTP.OK).json({
      success: true,
      message: 'Sucursal actualizada',
      data: sucursal
    });
  });

  deactivate = asyncHandler(async (req, res) => {
    const sucursal = await this.sucursalService.deactivateSucursal(req.params.id);

    if (!sucursal) {
      throw new AppError('Sucursal no encontrada', constants.HTTP.NOT_FOUND);
    }

    res.status(constants.HTTP.OK).json({
      success: true,
      message: 'Sucursal desactivada'
    });
  });

  activate = asyncHandler(async (req, res) => {
    const sucursal = await this.sucursalService.activateSucursal(req.params.id);

    if (!sucursal) {
      throw new AppError('Sucursal no encontrada', constants.HTTP.NOT_FOUND);
    }

    res.status(constants.HTTP.OK).json({
      success: true,
      message: 'Sucursal activada'
    });
  });
}

module.exports = SucursalController;
