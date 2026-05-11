const { DataTypes } = require('sequelize');

/**
 * Modelo Historial de Estado
 * Registra cada cambio de estado de un envío (inmutable)
 */
module.exports = (sequelize) => {
  const HistorialEstado = sequelize.define('HistorialEstado', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    envioId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    estadoAnterior: {
      type: DataTypes.ENUM('Recibido', 'En Viaje', 'Entregado'),
      allowNull: true
    },
    estadoNuevo: {
      type: DataTypes.ENUM('Recibido', 'En Viaje', 'Entregado'),
      allowNull: false
    },
    razon: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    operarioId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ubicacion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fotografia: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'historiales_estados',
    timestamps: true,
    updatedAt: false, // Registros immutables
    indexes: [
      { fields: ['envioId'] },
      { fields: ['operarioId'] },
      { fields: ['createdAt'] }
    ]
  });

  return HistorialEstado;
};
