// Archivo principal - Configuración de Express
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const errorMiddleware = require('./presentation/middlewares/error.middleware');
const notFoundMiddleware = require('./presentation/middlewares/notFound.middleware');
const buildRoutes = require('./presentation/routes');

const app = express();

// Middlewares de seguridad
app.use(helmet());

// CORS
const corsOptions = {
  origin: env.cors.origin === '*' ? '*' : env.cors.origin.split(',').map(o => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API RutaSync operativa',
    timestamp: new Date().toISOString()
  });
});

// Rutas API
const buildApp = (dependencies) => {
  const router = buildRoutes(dependencies);
  app.use('/api', router);
  
  // 404 Middleware (después de las rutas)
  app.use(notFoundMiddleware);
  
  // Error Middleware (último)
  app.use(errorMiddleware);
};

module.exports = { app, buildApp };
