const { DataTypes } = require('sequelize');

/**
 * Modelo Usuario
 * Representa usuarios del sistema (Admin y Operarios)
 */
module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM('ADMIN', 'OPERARIO'),
      allowNull: false,
      defaultValue: 'OPERARIO'
    },
    sucursalId: {
      type: DataTypes.UUID,
      allowNull: true // ADMIN puede no tener sucursal
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    telefonoContacto: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    ultimoAcceso: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['rol'] },
      { fields: ['sucursalId'] }
    ]
  });

  return User;
};
