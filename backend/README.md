# Backend RutaSync

Sistema de gestión de envíos logísticos con autenticación JWT, validación de DNI vía API RENIEC, y notificaciones automáticas por correo.

## 📋 Requisitos Previos

- Node.js 18.x o superior
- MySQL 8.0
- Redis (opcional, para invalidación de tokens)
- npm o yarn

## 🚀 Instalación Rápida

### 1. Clonar Repositorio

```bash
git clone https://github.com/usuario/rutasync.git
cd rutasync/backend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con valores reales
```

### 4. Inicializar Base de Datos

```bash
npm run migrate
npm run seed
```

### 5. Iniciar Servidor

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3001`

## 📂 Estructura de Carpetas

```
src/
├── presentation/        # Capa de presentación (HTTP)
│   ├── controllers/     # Manejadores de rutas
│   ├── routes/          # Definición de rutas
│   └── middlewares/     # Auth, validación, error
├── application/         # Capa de aplicación
│   └── services/        # Lógica de negocio
├── domain/              # Capa de dominio
│   ├── models/          # Entidades
│   ├── repositories/    # Interfaces de acceso
│   └── services/        # Servicios de dominio
├── data/                # Capa de datos
│   ├── models/          # Modelos Sequelize
│   ├── repositories/    # Implementación acceso
│   ├── migrations/      # Migraciones BD
│   └── seeders/         # Datos iniciales
├── shared/              # Código compartido
│   ├── utils/           # Utilidades
│   ├── events/          # Event emitter
│   └── constants/       # Constantes
├── config/              # Configuración
├── app.js               # Configuración Express
└── server.js            # Punto de entrada
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia en modo desarrollo

# Testing
npm test             # Ejecutar todos los tests
npm run test:watch   # Modo watch
npm run test:cov     # Cobertura

# Database
npm run migrate      # Ejecutar migraciones
npm run migrate:undo # Deshacer última migración
npm run seed         # Ejecutar seeders

# Linting
npm run lint         # Validar código
```

## 🔐 Autenticación JWT

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@rutasync.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "usuario": {
      "id": "uuid",
      "nombre": "Admin",
      "email": "admin@rutasync.com",
      "rol": "ADMIN"
    }
  }
}
```

### Usar Token en Peticiones

```bash
GET /api/shipments
Authorization: Bearer eyJhbGc...
```

## 📝 Credenciales por Defecto

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@rutasync.com | Admin123! | ADMIN |
| operario@rutasync.com | Operario123! | OPERARIO |

## 🔌 Endpoints Principales

### Autenticación
```
POST   /api/auth/login          - Login
POST   /api/auth/logout         - Logout
```

### Envíos
```
GET    /api/shipments           - Listar envíos
POST   /api/shipments           - Crear envío
GET    /api/shipments/:id       - Detalle envío
PATCH  /api/shipments/:id/estado - Actualizar estado
DELETE /api/shipments/:id       - Eliminar envío
```

### Tracking Público
```
GET    /api/tracking/:codigo    - Consultar tracking (sin autenticación)
```

### Usuarios (Admin)
```
GET    /api/users               - Listar usuarios
POST   /api/users               - Crear usuario
PATCH  /api/users/:id           - Editar usuario
PATCH  /api/users/:id/estado    - Desactivar usuario
```

### Sucursales
```
GET    /api/sucursales          - Listar sucursales
POST   /api/sucursales          - Crear sucursal
PATCH  /api/sucursales/:id      - Editar sucursal
```

### Reportes (Admin)
```
GET    /api/reportes            - Generar reporte PDF
```

## 🐳 Docker Compose

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Detener servicios
docker-compose down
```

## 🧪 Testing

```bash
# Unit tests
npm run test tests/unit

# Integration tests
npm run test tests/integration

# Con cobertura
npm run test:cov
```

## 📊 Estructura de Respuestas

### Exitosa (200, 201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Descripción opcional"
}
```

### Paginada (200)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 50,
    "totalPages": 5
  }
}
```

### Error (4xx, 5xx)
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    { "field": "email", "message": "Email inválido" }
  ]
}
```

## 🔒 Variables de Entorno Requeridas

- `JWT_SECRET` - Clave secreta para firmar JWT (mínimo 32 caracteres)
- `DB_HOST` - Host de MySQL
- `DB_NAME` - Nombre de base de datos
- `DB_USER` - Usuario de MySQL
- `DB_PASSWORD` - Contraseña de MySQL
- `SMTP_HOST` - Host SMTP para correos
- `SMTP_USER` - Usuario SMTP
- `SMTP_PASS` - Contraseña SMTP
- `RENIEC_API_KEY` - Clave API RENIEC

## 📈 Monitoreo

### Health Check
```bash
curl http://localhost:3001/health
```

### Logs
```bash
# En desarrollo
npm run dev          # Ver logs en consola

# Con Docker
docker-compose logs -f backend
```

## 🤝 Contribución

1. Crear rama: `git checkout -b feature/descripcion`
2. Hacer cambios
3. Commit: `git commit -m "feat: descripcion"`
4. Push: `git push origin feature/descripcion`
5. Pull Request

## 📚 Documentación Adicional

- [Arquitectura del Backend](../backend-architecture.md)
- [Requerimientos Completos](../RutaSync_Requerimientos_Copilot.md)
- [Diagramas de Clases](../docs/diagramas/03-diagrama-clases-backend.md)
- [Secuencias de Operaciones](../docs/diagramas/)

## 📄 Licencia

Proyecto educativo - SENATI 2026

## ✉️ Contacto

**Autor:** Ebert Alonso Valdez Reyes  
**Email:** ebert@rutasync.com
