const { DataTypes } = require('sequelize');

/**
 * Modelo Notificación
 * Registra notificaciones por email enviadas a clientes
 */
module.exports = (sequelize) => {
  const Notificacion = sequelize.define('Notificacion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    destinatarioEmail: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    asunto: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    envioId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    usuarioId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'ENVIADO', 'FALLIDO'),
      defaultValue: 'PENDIENTE'
    },
    mensajeError: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    intentos: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    proximoIntento: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'notificaciones',
    timestamps: true,
    indexes: [
      { fields: ['estado'] },
      { fields: ['envioId'] }
    ]
  });

  return Notificacion;
};
