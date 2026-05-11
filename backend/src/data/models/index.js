// Archivo de entrada para el índice de modelos
// Carga todos los modelos de Sequelize

const sequelize = require('../../config/database');

// Importar todas las definiciones de modelos
const User = require('./user.model')(sequelize);
const Shipment = require('./shipment.model')(sequelize);
const Sucursal = require('./sucursal.model')(sequelize);
const HistorialEstado = require('./historial-estado.model')(sequelize);
const Notificacion = require('./notificacion.model')(sequelize);

// Definir asociaciones entre modelos
User.hasMany(Shipment, { foreignKey: 'operarioAsignadoId' });
Shipment.belongsTo(User, { foreignKey: 'operarioAsignadoId', as: 'operario' });

Sucursal.hasMany(Shipment, { foreignKey: 'sucursalOrigenId' });
Shipment.belongsTo(Sucursal, { foreignKey: 'sucursalOrigenId', as: 'sucursalOrigen' });

Sucursal.hasMany(Shipment, { foreignKey: 'sucursalDestinoId' });
Shipment.belongsTo(Sucursal, { foreignKey: 'sucursalDestinoId', as: 'sucursalDestino' });

Shipment.hasMany(HistorialEstado, { foreignKey: 'envioId' });
HistorialEstado.belongsTo(Shipment, { foreignKey: 'envioId' });

HistorialEstado.belongsTo(User, { foreignKey: 'operarioId', as: 'operario' });

Shipment.hasMany(Notificacion, { foreignKey: 'envioId' });
Notificacion.belongsTo(Shipment, { foreignKey: 'envioId' });

User.hasMany(Notificacion, { foreignKey: 'usuarioId' });
Notificacion.belongsTo(User, { foreignKey: 'usuarioId' });

module.exports = {
  sequelize,
  User,
  Shipment,
  Sucursal,
  HistorialEstado,
  Notificacion
};
