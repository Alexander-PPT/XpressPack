// Configuración de inyección de dependencias
// Inicializa todos los repositorios, servicios y controladores

const { User, Shipment, Sucursal, HistorialEstado, Notificacion } = require('../data/models');
const UserSequelizeRepository = require('../data/repositories/user.sequelize-repository');
const ShipmentSequelizeRepository = require('../data/repositories/shipment.sequelize-repository');
const NotificationSequelizeRepository = require('../data/repositories/notification.sequelize-repository');
const SucursalSequelizeRepository = require('../data/repositories/sucursal.sequelize-repository');
const AuthService = require('../application/services/auth.service');
const ShipmentService = require('../application/services/shipment.service');
const NotificationService = require('../application/services/notification.service');
const ReportService = require('../application/services/report.service');
const UserService = require('../application/services/user.service');
const SucursalService = require('../application/services/sucursal.service');
const ReniecService = require('../domain/services/reniec.service');
const AuthController = require('../presentation/controllers/auth.controller');
const ShipmentController = require('../presentation/controllers/shipment.controller');
const NotificationController = require('../presentation/controllers/notification.controller');
const ReportController = require('../presentation/controllers/report.controller');
const UserController = require('../presentation/controllers/user.controller');
const SucursalController = require('../presentation/controllers/sucursal.controller');
const DniController = require('../presentation/controllers/dni.controller');

/**
 * Crea y retorna todas las dependencias inyectadas
 */
const configureDependencies = () => {
  // ============ SERVICIOS EXTERNOS ============
  const reniecService = new ReniecService();

  // ============ REPOSITORIOS ============
  const userRepository = new UserSequelizeRepository(User);
  const shipmentRepository = new ShipmentSequelizeRepository(Shipment, HistorialEstado);
  const notificationRepository = new NotificationSequelizeRepository(Notificacion);
  const sucursalRepository = new SucursalSequelizeRepository(Sucursal);

  // ============ SERVICIOS DE APLICACIÓN ============
  const authService = new AuthService(userRepository);
  const shipmentService = new ShipmentService(shipmentRepository, reniecService);
  const notificationService = new NotificationService(notificationRepository);
  const reportService = new ReportService(shipmentRepository);
  const userService = new UserService(userRepository, sucursalRepository);
  const sucursalService = new SucursalService(sucursalRepository);

  // ============ CONTROLADORES ============
  const authController = new AuthController(authService);
  const shipmentController = new ShipmentController(shipmentService);
  const notificationController = new NotificationController(notificationService);
  const reportController = new ReportController(reportService);
  const userController = new UserController(userService);
  const sucursalController = new SucursalController(sucursalService);
  const dniController = new DniController(reniecService);

  return {
    // Modelos
    models: {
      User,
      Shipment,
      Sucursal,
      HistorialEstado,
      Notificacion
    },

    // Repositorios
    repositories: {
      userRepository,
      shipmentRepository,
      notificationRepository,
      sucursalRepository
    },

    // Servicios Externos
    externalServices: {
      reniecService
    },

    // Servicios de Aplicación
    services: {
      authService,
      shipmentService,
      notificationService,
      reportService,
      userService,
      sucursalService
    },

    // Controladores
    controllers: {
      authController,
      shipmentController,
      notificationController,
      reportController,
      userController,
      sucursalController,
      dniController
    }
  };
};

module.exports = configureDependencies;
