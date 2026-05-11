// Punto de entrada del servidor
const { app, buildApp } = require('./app');
const env = require('./config/env');
const sequelize = require('./config/database');
const configureDependencies = require('./config/dependencies');
const { setupNotificationListeners } = require('./shared/events/notification-listeners');

async function startServer() {
  try {
    // Autentica conexión a MySQL
    await sequelize.authenticate();
    console.log('✓ Conexión a MySQL establecida correctamente');
    
    // Sincroniza modelos (solamente en desarrollo)
    if (env.app.env === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✓ Modelos sincronizados');
    }

    // Configura inyección de dependencias
    const dependencies = configureDependencies();
    buildApp(dependencies);
    
    // Inicializa event listeners para notificaciones
    setupNotificationListeners(
      dependencies.services.notificationService,
      dependencies.repositories.shipmentRepository
    );
    
    console.log('✓ Dependencias inyectadas');
    console.log('✓ Event listeners configurados');
    
    // Inicia servidor
    app.listen(env.app.port, env.app.host, () => {
      console.log(`✓ Servidor escuchando en http://${env.app.host}:${env.app.port}`);
      console.log(`Ambiente: ${env.app.env}`);
      console.log('\n📋 Endpoints disponibles:');
      console.log('  - POST   /api/auth/login');
      console.log('  - POST   /api/auth/logout');
      console.log('  - GET    /health');
    });
  } catch (error) {
    console.error('✗ Error iniciando servidor:', error.message);
    process.exit(1);
  }
}

// Manejo de excepciones no capturadas
process.on('unhandledRejection', (err) => {
  console.error('✗ Rechazo no manejado:', err);
  process.exit(1);
});

startServer();
