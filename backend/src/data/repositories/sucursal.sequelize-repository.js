/**
 * Implementacion del Repositorio de Sucursal con Sequelize
 * Acceso a datos para entidad Sucursal
 */
class SucursalSequelizeRepository {
  constructor(sucursalModel) {
    this.sucursalModel = sucursalModel;
  }

  async findById(id) {
    return await this.sucursalModel.findByPk(id);
  }

  async findByCodigo(codigo) {
    return await this.sucursalModel.findOne({ where: { codigo } });
  }

  async findAll(filters = {}) {
    const where = {};

    if (filters.estado !== undefined) where.estado = filters.estado;
    if (filters.ciudad) where.ciudad = filters.ciudad;
    if (filters.departamento) where.departamento = filters.departamento;

    return await this.sucursalModel.findAll({
      where,
      order: [['nombre', 'ASC']]
    });
  }

  async create(data) {
    return await this.sucursalModel.create(data);
  }

  async update(id, data) {
    const sucursal = await this.sucursalModel.findByPk(id);

    if (!sucursal) {
      return null;
    }

    const { codigo, ...datosPermitidos } = data;
    return await sucursal.update(datosPermitidos);
  }

  async delete(id) {
    const sucursal = await this.sucursalModel.findByPk(id);

    if (!sucursal) {
      return null;
    }

    return await sucursal.update({ estado: false });
  }
}

module.exports = SucursalSequelizeRepository;
