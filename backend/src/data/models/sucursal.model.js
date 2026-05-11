const { DataTypes } = require('sequelize');

/**
 * Modelo Sucursal
 * Representa puntos de atención del servicio de logística
 */
module.exports = (sequelize) => {
  const Sucursal = sequelize.define('Sucursal', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    ciudad: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    departamento: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    encargado: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'sucursales',
    timestamps: true,
    indexes: [
      { fields: ['codigo'] },
      { fields: ['ciudad'] }
    ]
  });

  return Sucursal;
};
