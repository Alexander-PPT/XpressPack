const { DataTypes } = require('sequelize');

/**
 * Modelo Envío (Shipment)
 * Representa envíos logísticos en el sistema
 */
module.exports = (sequelize) => {
  const Shipment = sequelize.define('Shipment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    guia: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    codigoTracking: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    remitenteDni: {
      type: DataTypes.CHAR(8),
      allowNull: false
    },
    remitenteNombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    remitenteEmail: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    remitentePhone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    destinatarioDni: {
      type: DataTypes.CHAR(8),
      allowNull: false
    },
    destinatarioNombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    destinatarioEmail: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    destinatarioPhone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    peso: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      validate: {
        min: 0.1
      }
    },
    volumen: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true
    },
    tipoServicio: {
      type: DataTypes.STRING(50),
      allowNull: false // Ej: EXPRESS, STANDAR
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('Recibido', 'En Viaje', 'Entregado'),
      defaultValue: 'Recibido'
    },
    sucursalOrigenId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sucursalDestinoId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    operarioAsignadoId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    fechaEntrega: {
      type: DataTypes.DATE,
      allowNull: true
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
  }, {
    tableName: 'envios',
    timestamps: true,
    indexes: [
      { fields: ['guia'] },
      { fields: ['codigoTracking'] },
      { fields: ['estado'] },
      { fields: ['remitenteDni'] },
      { fields: ['destinatarioDni'] },
      { fields: ['sucursalOrigenId'] },
      { fields: ['sucursalDestinoId'] },
      { fields: ['operarioAsignadoId'] }
    ]
  });

  return Shipment;
};
