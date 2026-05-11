# Arquitectura del Backend — RutaSync

**Versión:** 2.0  
**Fecha:** 10 de mayo de 2026

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Principios Arquitectónicos](#principios-arquitectónicos)
3. [Estructura de Directorios](#estructura-de-directorios)
4. [Patrones y Convenciones](#patrones-y-convenciones)
5. [Descripción de Módulos](#descripción-de-módulos)
6. [Flujos de Dependencias](#flujos-de-dependencias)
7. [Configuración y Setup](#configuración-y-setup)
8. [Plan de Implementación](#plan-de-implementación)

---

## 🏗️ Descripción General

El backend de RutaSync sigue una **arquitectura por capas (layered architecture)** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────┐
│         CAPA PRESENTACIÓN                │
│    (Controllers, Routes, Middlewares)    │
│         Puerto 3001                      │
└─────────────────────┬─────────────────────┘
                      │
┌─────────────────────▼─────────────────────┐
│         CAPA APLICACIÓN                   │
│    (Services, Casos de Uso, Orquestación) │
└─────────────────────┬─────────────────────┘
                      │
┌─────────────────────▼─────────────────────┐
│         CAPA DOMINIO                      │
│    (Entidades, Reglas Negocio, Interfaces)│
└─────────────────────┬─────────────────────┘
                      │
┌─────────────────────▼─────────────────────┐
│         CAPA DATOS                        │
│    (Repositories, ORM, Migraciones)       │
└─────────────────────────────────────────┘
                      │
              ┌───────┴────────┐
              │                │
          ┌───▼──┐        ┌───▼──┐
          │MySQL │        │Redis │
          └──────┘        └──────┘
```

---

## 🎯 Principios Arquitectónicos

### 1. **Separación de Responsabilidades**

Cada capa tiene responsabilidades claras y bien definidas:

- **Presentación:** HTTP, validación de entrada, serialización
- **Aplicación:** Orquestación, transacciones, lógica de casos de uso
- **Dominio:** Reglas de negocio, entidades, validaciones core
- **Datos:** Persistencia, queries, migraciones

### 2. **Dependencia Unidireccional**

Las capas superiores dependen de las inferiores, nunca al revés:

```
Presentación → Aplicación → Dominio → Datos
               ↓            ↓         ↓
            Database,    Entidades  MySQL
            Redis, etc.  Interfaces Sequelize
```

### 3. **Inyección de Dependencias**

Todas las dependencias se inyectan, facilita testing y desacoplamiento:

```javascript
// En lugar de:
class UserService {
  constructor() {
    this.repo = new UserRepository();
  }
}

// Hacer:
class UserService {
  constructor(userRepository) {
    this.repo = userRepository;  // Inyectado
  }
}
```

### 4. **Interfaces y Contratos**

Se definen interfaces para las dependencias externas:

```typescript
interface IUserRepository {
  findByEmail(email: string): Promise<User>;
  create(data: CreateUserData): Promise<User>;
  // ...
}
```

### 5. **Immutabilidad de Datos Históricos**

Registros históricos (HistorialEstado, Notificaciones) son **inmutables una vez creados**:

```javascript
// ✅ Permitido: Crear nuevo registro
await historialEstadoRepository.create({...});

// ❌ No permitido: Actualizar histórico
await historialEstado.update({...});  // Lanzaría error
```

---

## 📂 Estructura de Directorios

```
backend/
├── src/
│   ├── presentation/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── shipment.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── sucursal.controller.js
│   │   │   └── report.controller.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── auth.routes.js
│   │   │   ├── shipment.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── sucursal.routes.js
│   │   │   └── report.routes.js
│   │   └── middlewares/
│   │       ├── auth.middleware.js
│   │       ├── error.middleware.js
│   │       ├── validate.middleware.js
│   │       ├── notFound.middleware.js
│   │       └── validation-rules.js
│   │
│   ├── application/
│   │   └── services/
│   │       ├── auth.service.js
│   │       ├── shipment.service.js
│   │       ├── user.service.js
│   │       ├── sucursal.service.js
│   │       ├── report.service.js
│   │       ├── notification.service.js
│   │       └── dns-lookup.service.js
│   │
│   ├── domain/
│   │   ├── models/
│   │   │   ├── user.entity.js
│   │   │   ├── shipment.entity.js
│   │   │   ├── sucursal.entity.js
│   │   │   ├── state.entity.js
│   │   │   └── notification.entity.js
│   │   ├── repositories/
│   │   │   ├── user.repository.js
│   │   │   ├── shipment.repository.js
│   │   │   ├── sucursal.repository.js
│   │   │   ├── state.repository.js
│   │   │   └── notification.repository.js
│   │   └── services/
│   │       └── dns-lookup.service.js
│   │
│   ├── data/
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── shipment.model.js
│   │   │   ├── sucursal.model.js
│   │   │   ├── state.model.js
│   │   │   ├── history.model.js
│   │   │   ├── notification.model.js
│   │   │   ├── role.model.js
│   │   │   └── index.js
│   │   ├── repositories/
│   │   │   ├── user.repository.js
│   │   │   ├── shipment.repository.js
│   │   │   ├── sucursal.repository.js
│   │   │   ├── state.repository.js
│   │   │   ├── history.repository.js
│   │   │   └── notification.repository.js
│   │   ├── migrations/
│   │   │   ├── 20260501000001-create-roles-table.js
│   │   │   ├── 20260501000002-create-users-table.js
│   │   │   ├── 20260501000003-create-sucursales-table.js
│   │   │   ├── 20260501000004-create-shipments-table.js
│   │   │   ├── 20260501000005-create-states-table.js
│   │   │   ├── 20260501000006-create-history-table.js
│   │   │   └── 20260501000007-create-notifications-table.js
│   │   ├── seeders/
│   │   │   ├── 20260501000001-seed-roles.js
│   │   │   ├── 20260501000002-seed-states.js
│   │   │   ├── 20260501000003-seed-sucursales.js
│   │   │   └── 20260501000004-seed-admin-user.js
│   │   └── index.js
│   │
│   ├── shared/
│   │   ├── utils/
│   │   │   ├── app-error.js
│   │   │   ├── async-handler.js
│   │   │   ├── sanitize.js
│   │   │   ├── validators.js
│   │   │   └── generate-code.js
│   │   ├── events/
│   │   │   └── event-emitter.js
│   │   └── constants/
│   │       ├── error-codes.js
│   │       ├── http-status.js
│   │       └── business-rules.js
│   │
│   ├── config/
│   │   ├── env.js
│   │   ├── database.js
│   │   ├── dependencies.js
│   │   ├── sequelize-cli.js
│   │   └── jwt.js
│   │
│   ├── app.js
│   └── server.js
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .dockerignore
├── Dockerfile
├── package.json
├── sequelize.config.js
└── README.md
```

---

## 📐 Patrones y Convenciones

### 1. **Convención de Nombres**

```javascript
// Archivos
- Controllers: {entidad}.controller.js
- Services: {entidad}.service.js
- Repositories: {entidad}.repository.js
- Models (Sequelize): {entidad}.model.js
- Migrations: YYYYMMDDHHMMSS-{descripción}.js

// Clases y Funciones
- Controllers: {Entidad}Controller
- Services: {Entidad}Service
- Repositories: {Entidad}Repository
- Funciones privadas prefijo _

// Variables
- Constantes: UPPER_SNAKE_CASE
- Variables: camelCase
- Parámetros de ruta: :id, :email
```

### 2. **Estructura de Error**

```javascript
// AppError (clase personalizada)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Uso:
throw new AppError('Usuario no encontrado', 404);

// Respuesta al cliente:
{
  success: false,
  message: 'Usuario no encontrado',
  status: 404
}
```

### 3. **Estructura de Respuesta Exitosa**

```javascript
// Para crear (201):
{
  success: true,
  message: 'Envío creado exitosamente',
  data: { ... }
}

// Para leer (200):
{
  success: true,
  data: { ... }
}

// Para listar con paginación (200):
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 50,
    totalPages: 5
  }
}
```

### 4. **Async/Await Wrapper**

Para manejar errores automáticamente en rutas:

```javascript
// shared/utils/async-handler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Uso en controller:
router.post('/login', asyncHandler(async (req, res) => {
  const result = await authService.authenticate(req.body);
  res.json(result);  // Si hay error, catch automático
}));
```

### 5. **Validación en Middleware**

```javascript
// validation-rules.js
const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  validationResult  // Middleware que valida
];

// Uso en ruta:
router.post('/login', loginRules, loginController);
```

---

## 🔧 Descripción de Módulos

### **CAPA PRESENTACIÓN**

#### Controllers

```javascript
// presentation/controllers/auth.controller.js
class AuthController {
  constructor(authService) {
    this.authService = authService;
  }
  
  async login(req, res, next) {
    const { email, password } = req.body;
    const result = await this.authService.authenticate(email, password);
    res.status(200).json({
      success: true,
      data: result
    });
  }
  
  async logout(req, res, next) {
    const token = req.headers.authorization.substring(7);
    await this.authService.revokeToken(token);
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada'
    });
  }
}

module.exports = AuthController;
```

**Responsabilidades:**
- Extraer datos de request
- Validar JWT
- Delegar a services
- Formatear respuestas HTTP
- Manejar errores

#### Routes

```javascript
// presentation/routes/auth.routes.js
const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginRules, validate } = require('../middlewares/validate.middleware');

module.exports = (dependencies) => {
  const router = express.Router();
  const authController = new AuthController(dependencies.authService);
  
  // POST /api/auth/login
  router.post(
    '/login',
    loginRules,
    validate,
    (req, res, next) => authController.login(req, res, next)
  );
  
  // POST /api/auth/logout
  router.post(
    '/logout',
    authenticate,
    (req, res, next) => authController.logout(req, res, next)
  );
  
  return router;
};
```

#### Middlewares

```javascript
// presentation/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Valida blacklist (opcional)
    const isBlacklisted = await checkBlacklist(decoded.sub);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token ha sido invalidado'
      });
    }
    
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
}

module.exports = { authenticate };
```

### **CAPA APLICACIÓN**

#### Services

```javascript
// application/services/shipment.service.js
class ShipmentService {
  constructor(
    shipmentRepository,
    stateRepository,
    userService,
    notificationService,
    eventEmitter
  ) {
    this.shipmentRepository = shipmentRepository;
    this.stateRepository = stateRepository;
    this.userService = userService;
    this.notificationService = notificationService;
    this.eventEmitter = eventEmitter;
  }
  
  async createShipment(shipmentData, usuarioId) {
    // Valida DNI del destinatario
    const dniValidation = await this.userService.validateDNI(
      shipmentData.destinatarioDni
    );
    
    if (!dniValidation.esValido) {
      throw new AppError('DNI inválido', 400);
    }
    
    // Genera guía y código de tracking
    const guia = this._generarGuia();
    const codigoTracking = this._generarCodigoTracking();
    
    // Obtiene estado inicial
    const estadoRecibido = await this.stateRepository.findByNombre('Recibido');
    
    // Crea envío
    const shipment = await this.shipmentRepository.create({
      ...shipmentData,
      guia,
      codigoTracking,
      estadoActualId: estadoRecibido.id,
      creadoPor: usuarioId
    });
    
    // Publica evento de forma asíncrona
    setImmediate(() => {
      this.eventEmitter.emit('shipment.created', {
        shipmentId: shipment.id,
        codigoTracking: shipment.codigoTracking,
        destinatario: shipmentData.destinatarioEmail
      });
    });
    
    return shipment;
  }
  
  _generarGuia() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7).toUpperCase();
    return `GUA-${timestamp}-${random}`;
  }
  
  _generarCodigoTracking() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 10; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
  }
}

module.exports = ShipmentService;
```

**Responsabilidades:**
- Orquestación de lógica compleja
- Validaciones de negocio
- Transacciones
- Publicación de eventos
- Integración con servicios externos

### **CAPA DOMINIO**

#### Entidades

```javascript
// domain/models/shipment.entity.js
class Shipment {
  constructor(data) {
    this.id = data.id;
    this.guia = data.guia;
    this.codigoTracking = data.codigoTracking;
    this.origen = data.origen;
    this.destino = data.destino;
    // ... más atributos
    this.estadoActualId = data.estadoActualId;
    this.creadoEn = data.creadoEn;
  }
  
  // Validaciones de dominio
  esValido() {
    return this.codigoTracking && this.estadoActualId;
  }
  
  puedeTransicionarA(nuevoEstado) {
    const transiciones = {
      1: [2],      // Recibido → En Viaje
      2: [3],      // En Viaje → Entregado
      3: []        // Entregado (terminal)
    };
    return transiciones[this.estadoActualId]?.includes(nuevoEstado.id) ?? false;
  }
}

module.exports = Shipment;
```

#### Interfaces de Repositories

```javascript
// domain/repositories/shipment.repository.js
class IShipmentRepository {
  async findById(id) {
    throw new Error('Método no implementado');
  }
  
  async findByTrackingCode(codigo) {
    throw new Error('Método no implementado');
  }
  
  async create(data) {
    throw new Error('Método no implementado');
  }
  
  async updateState(id, nuevoEstado) {
    throw new Error('Método no implementado');
  }
  
  async findAll(page, pageSize) {
    throw new Error('Método no implementado');
  }
}

module.exports = IShipmentRepository;
```

### **CAPA DATOS**

#### Modelos Sequelize

```javascript
// data/models/shipment.model.js
module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define(
    'Shipment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      guia: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      codigoTracking: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      origen: {
        type: DataTypes.STRING,
        allowNull: false
      },
      destino: {
        type: DataTypes.STRING,
        allowNull: false
      },
      remitenteNombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      destinatarioNombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      destinatarioDni: {
        type: DataTypes.STRING,
        allowNull: false
      },
      peso: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      dimensiones: {
        type: DataTypes.STRING
      },
      tipoServicio: {
        type: DataTypes.STRING,
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT
      },
      estadoActualId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'ShipmentStates',
          key: 'id'
        }
      },
      sucursalOrigenId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      sucursalDestinoId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      creadoPor: {
        type: DataTypes.UUID,
        allowNull: false
      },
      creadoEn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      actualizadoEn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      timestamps: true,
      tableName: 'shipments'
    }
  );
  
  // Asociaciones
  Shipment.associate = (models) => {
    Shipment.belongsTo(models.ShipmentState, {
      foreignKey: 'estadoActualId',
      as: 'estadoActual'
    });
    Shipment.belongsTo(models.User, {
      foreignKey: 'creadoPor'
    });
    Shipment.hasMany(models.ShipmentHistory, {
      foreignKey: 'shipmentId',
      as: 'historial'
    });
  };
  
  return Shipment;
};
```

#### Repositories (Implementación)

```javascript
// data/repositories/shipment.repository.js
class ShipmentRepository extends IShipmentRepository {
  constructor(ShipmentModel) {
    super();
    this.Shipment = ShipmentModel;
  }
  
  async findById(id) {
    return await this.Shipment.findByPk(id, {
      include: [
        { association: 'estadoActual' },
        { association: 'historial' }
      ]
    });
  }
  
  async findByTrackingCode(codigo) {
    return await this.Shipment.findOne({
      where: { codigoTracking: codigo }
    });
  }
  
  async create(data) {
    return await this.Shipment.create(data);
  }
  
  async findAll(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const { count, rows } = await this.Shipment.findAndCountAll({
      offset,
      limit: pageSize,
      order: [['creadoEn', 'DESC']]
    });
    
    return {
      data: rows,
      pagination: {
        page,
        pageSize,
        totalItems: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }
}

module.exports = ShipmentRepository;
```

---

## 🔗 Flujos de Dependencias

### Flujo de Inyección de Dependencias

```javascript
// config/dependencies.js
const AuthService = require('../application/services/auth.service');
const ShipmentService = require('../application/services/shipment.service');
const AuthController = require('../presentation/controllers/auth.controller');

// Instancia repositories
const userRepository = new UserRepository(User);
const shipmentRepository = new ShipmentRepository(Shipment);

// Instancia services
const authService = new AuthService(userRepository);
const shipmentService = new ShipmentService(
  shipmentRepository,
  stateRepository,
  userService,
  notificationService,
  eventEmitter
);

// Instancia controllers
const authController = new AuthController(authService);
const shipmentController = new ShipmentController(shipmentService);

// Exporta todas las dependencias
module.exports = {
  authService,
  shipmentService,
  authController,
  shipmentController,
  // ... más
};
```

### Uso en Routes

```javascript
// presentation/routes/index.js
module.exports = (dependencies) => {
  const router = express.Router();
  
  // Pasa dependencias a cada módulo de rutas
  router.use('/auth', require('./auth.routes')(dependencies));
  router.use('/shipments', require('./shipment.routes')(dependencies));
  router.use('/users', require('./user.routes')(dependencies));
  
  return router;
};
```

---

## ⚙️ Configuración y Setup

### 1. Variables de Entorno

```bash
# .env
NODE_ENV=development
APP_PORT=3001
APP_HOST=localhost

# Database
DB_HOST=mysql
DB_PORT=3306
DB_NAME=rutasync_db
DB_USER=root
DB_PASSWORD=password123

# JWT
JWT_SECRET=super_secret_key_min_32_chars_very_long
JWT_EXPIRES_IN=24h

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@rutasync.com
SMTP_PASS=app_password_here
SMTP_FROM=RutaSync <noreply@rutasync.com>

# CORS
CORS_ORIGIN=http://localhost:3000

# APIs Externas
RENIEC_API_URL=https://api.reniec.gob.pe
RENIEC_API_KEY=tu_api_key_aqui
```

### 2. Configuración Express

```javascript
// config/env.js
require('dotenv').config();

module.exports = {
  app: {
    port: process.env.APP_PORT || 3001,
    host: process.env.APP_HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
  },
  cors: {
    origin: process.env.CORS_ORIGIN
  }
  // ... más configuraciones
};
```

### 3. Inicializacióndel Servidor

```javascript
// server.js
const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./data/models');

async function startServer() {
  try {
    // Autentica conexión a MySQL
    await sequelize.authenticate();
    console.log('✓ Conexión a MySQL establecida');
    
    // Sincroniza modelos (desarrollo solamente)
    if (env.app.env === 'development') {
      await sequelize.sync({ alter: true });
    }
    
    // Inicia servidor
    app.listen(env.app.port, () => {
      console.log(`✓ Servidor escuchando en puerto ${env.app.port}`);
      console.log(`Ambiente: ${env.app.env}`);
    });
  } catch (error) {
    console.error('✗ Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();
```

---

## 📋 Plan de Implementación

### **Fase 1: Setup Base** (Semana 1)

- [ ] Crear estructura de directorios
- [ ] Configurar dependencias (package.json)
- [ ] Setup Express básico
- [ ] Configurar Sequelize y MySQL
- [ ] Crear modelos de BD
- [ ] Setup migraciones

**Entregable:** Proyecto base con BD lista

### **Fase 2: Autenticación** (Semana 2)

- [ ] Implementar UserRepository
- [ ] Implementar AuthService
- [ ] Crear AuthController
- [ ] Setup JWT + Bcrypt
- [ ] Crear middleware de autenticación
- [ ] Tests de autenticación

**Entregable:** Login/Logout funcional

### **Fase 3: CRUD de Envíos** (Semana 3)

- [ ] Implementar ShipmentRepository
- [ ] Implementar ShipmentService
- [ ] Crear ShipmentController
- [ ] Rutas GET, POST, PATCH, DELETE
- [ ] Validación de DNI (RENIEC)
- [ ] Tests de envíos

**Entregable:** Registro y actualización de envíos funcional

### **Fase 4: Historial y Notificaciones** (Semana 4)

- [ ] Implementar HistoryRepository
- [ ] Publicación de eventos
- [ ] Setup Nodemailer
- [ ] NotificationService
- [ ] Tests

**Entregable:** Trazabilidad y correos automáticos

### **Fase 5: Reportes** (Semana 5)

- [ ] ReportService
- [ ] Generación PDF con pdfmake
- [ ] Filtros y paginación
- [ ] Tests

**Entregable:** Reportes PDF descargables

### **Fase 6: Gestión de Usuarios y Sucursales** (Semana 6)

- [ ] UserController completo
- [ ] SucursalRepository y Controller
- [ ] Validación de roles
- [ ] Tests

**Entregable:** Gestión completa (Admin solamente)

### **Fase 7: Validación Completa y Optimización** (Semana 7)

- [ ] Tests unitarios (>80% cobertura)
- [ ] Tests de integración
- [ ] Performance profiling
- [ ] Optimización de queries
- [ ] Documentación API

**Entregable:** Backend completamente funcional y testeado

---

## 🧪 Testing Strategy

### Unit Tests (Services)

```javascript
// tests/unit/services/auth.service.test.js
describe('AuthService', () => {
  let authService;
  let userRepository;
  
  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn()
    };
    authService = new AuthService(userRepository);
  });
  
  it('debe autenticar usuario válido', async () => {
    const user = { id: '1', email: 'test@test.com', passwordHash: '...' };
    userRepository.findByEmail.mockResolvedValue(user);
    
    const result = await authService.authenticate('test@test.com', 'password');
    
    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
  });
});
```

### Integration Tests (Routes)

```javascript
// tests/integration/auth.routes.test.js
describe('POST /api/auth/login', () => {
  it('debe retornar JWT para credenciales válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@rutasync.com',
        password: 'Admin123!'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
  });
});
```

---

## 📊 Checklist de Calidad

- [ ] Code review completado
- [ ] Tests (>80% cobertura)
- [ ] Logging y monitoreo
- [ ] Documentación API
- [ ] CORS configurado
- [ ] Rate limiting implementado
- [ ] Error handling robusto
- [ ] Validación de entrada
- [ ] Encriptación de contraseñas
- [ ] JWT seguro
- [ ] Índices DB optimizados
- [ ] Transacciones en operaciones críticas
- [ ] Manejo de eventos asíncrono
- [ ] Reintentos en fallos
- [ ] Security headers (Helmet)

---

## 🚀 Despliegue

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

### Docker Compose

```yaml
backend:
  build: ./backend
  ports:
    - "3001:3001"
  environment:
    - JWT_SECRET=${JWT_SECRET}
    - DB_HOST=mysql
    - REDIS_HOST=redis
  depends_on:
    - mysql
    - redis
  volumes:
    - ./backend:/app
    - /app/node_modules
```

---

## 📝 Conclusión

Esta arquitectura garantiza:
- **Mantenibilidad:** Separación clara de responsabilidades
- **Escalabilidad:** Fácil agregar nuevas funcionalidades
- **Testabilidad:** Componentes desacoplados, fáciles de testear
- **Seguridad:** Validaciones en múltiples niveles
- **Rendimiento:** Índices, caché, queries optimizadas

El siguiente paso es implementar la Fase 1 del plan.
