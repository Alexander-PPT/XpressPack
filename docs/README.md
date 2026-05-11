# RutaSync — Documentación Completa del Sistema

**Versión:** 2.0  
**Proyecto Final Full Stack**  
**Autor:** Ebert Alonso Valdez Reyes  
**Carrera:** Ingeniería de Software con Inteligencia Artificial  
**Institución:** SENATI — Dirección Zonal Arequipa - Puno | 2026

---

## 📋 Índice

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Documentación de Diagramas](#documentación-de-diagramas)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitectura del Sistema](#arquitectura-del-sistema)
5. [Guía de Inicio Rápido](#guía-de-inicio-rápido)
6. [Estructura de Carpetas](#estructura-de-carpetas)
7. [Requerimientos Funcionales](#requerimientos-funcionales)
8. [Requerimientos No Funcionales](#requerimientos-no-funcionales)

---

## 🎯 Descripción del Proyecto

**RutaSync** es una aplicación web Full Stack para **trazabilidad logística de envíos**. El sistema está diseñado con dos objetivos centrales:

- **Panel de Administración Privado:** Simplifica la gestión administrativa del personal interno mediante un dashboard intuitivo.
- **Landing Page Pública:** Ofrece al cliente final una experiencia de consulta de alto impacto visual del estado de su paquete, sin autenticación.

### Actores del Sistema

| Actor | Tipo | Descripción |
|-------|------|-------------|
| **Administrador** | Autenticado (interno) | Acceso total. Gestiona usuarios, sucursales, genera reportes PDF. |
| **Operario** | Autenticado (interno, rol restringido) | Registra y actualiza envíos. Acceso limitado. |
| **Cliente Público** | No autenticado | Consulta estado de paquete mediante código de tracking. |

---

## 📚 Documentación de Diagramas

La documentación completa está organizada en la carpeta [`docs/diagramas/`](docs/diagramas/):

### **01 — Diagrama de Casos de Uso**
📄 [`01-casos-de-uso.md`](docs/diagramas/01-casos-de-uso.md)

Especifica todos los casos de uso del sistema:
- Casos de uso por actor (Cliente, Operario, Admin)
- Relaciones de inclusión y restricciones de acceso
- Flujos de interacción típicos
- Validaciones de negocio

**Contenido:**
- CU-01: Consultar Tracking de Envío
- CU-02: Iniciar Sesión (Autenticación JWT)
- CU-03: Registrar Nuevo Envío
- CU-04: Actualizar Estado Logístico
- CU-05: Visualizar Historial
- CU-06: Cerrar Sesión
- CU-07: Generar Reporte PDF (solo Admin)
- CU-08: Gestionar Usuarios (solo Admin)
- CU-09: Gestionar Sucursales (solo Admin)

---

### **02 — Diagrama de Clases Frontend**
📄 [`02-diagrama-clases-frontend.md`](docs/diagramas/02-diagrama-clases-frontend.md)

Describe la arquitectura de la aplicación React + TypeScript:
- Componentes principales (Pages)
- Servicios compartidos (API, Autenticación, Dominio)
- Componentes UI reutilizables
- Modelos e interfaces TypeScript
- Flujos de datos

**Componentes Principales:**
- **LoginPage:** Autenticación de usuarios
- **DashboardPage:** Panel ejecutivo
- **EnviosPage:** Listado paginado de envíos
- **RegistroEnvioPage:** Formulario de registro
- **DetalleEnvioPage:** Vista detallada de envío
- **UsuariosPage:** Gestión de usuarios (Admin)
- **ReportesPage:** Generación de reportes (Admin)

**Servicios:**
- `AuthService`: Autenticación
- `ApiService`: Cliente HTTP
- `EnvioService`: Operaciones de envíos
- `UsuarioService`: Gestión de usuarios
- `SucursalService`: Gestión de sucursales
- `ReporteService`: Generación de reportes
- `NotificacionService`: Notificaciones

---

### **03 — Diagrama de Clases Backend**
📄 [`03-diagrama-clases-backend.md`](docs/diagramas/03-diagrama-clases-backend.md)

Define el modelo de datos relacional en MySQL:
- Entidades principales (Usuario, Envío, Estado, Historial)
- Atributos y métodos de cada entidad
- Relaciones y multiplicidades
- Restricciones de integridad
- Migraciones Sequelize

**Entidades:**
1. **Usuario:** Usuarios internos autenticados
2. **RolUsuario:** Catálogo de roles (ADMIN, OPERARIO)
3. **Sucursal:** Ubicaciones logísticas
4. **Envío:** Paquetes registrados (entidad central)
5. **EstadoEnvío:** Catálogo de estados (Recibido, En Viaje, Entregado)
6. **HistorialEstado:** Registro inmutable de cambios de estado
7. **Notificación:** Registros de correos enviados

---

### **04 — Diagrama de Secuencia: Login y Autenticación JWT**
📄 [`04-secuencia-login-jwt.md`](docs/diagramas/04-secuencia-login-jwt.md)

Detalla el flujo completo de autenticación:
- Participantes (Usuario, Frontend, Nginx, Backend, MySQL, Redis)
- Pasos de la autenticación (captura credenciales → validación → generación JWT)
- Validación de contraseña con Bcrypt
- Configuración de seguridad
- Uso del JWT en peticiones posteriores
- Cierre de sesión (logout)

**Flujo:**
1. Usuario ingresa credenciales
2. Frontend POST /api/auth/login
3. Backend valida contraseña con Bcrypt
4. Backend genera JWT firmado
5. Frontend almacena JWT en localStorage
6. JWT se usa en header de peticiones posteriores
7. Middleware valida JWT en cada petición

---

### **05 — Diagrama de Secuencia: Registro de Envío con DNI**
📄 [`05-secuencia-registro-envio.md`](docs/diagramas/05-secuencia-registro-envio.md)

Describe el proceso de registro de un nuevo envío:
- Validación de DNI via API RENIEC
- Creación de registro en BD
- Generación de código de tracking único
- Publicación de eventos para procesamiento asíncrono
- Envío de notificaciones automáticas

**Flujo:**
1. Empleado ingresa datos del envío
2. Frontend valida datos locales
3. Backend solicita validación de DNI a API RENIEC
4. API RENIEC valida y retorna resultado
5. Backend crea registro en BD (estado inicial: Recibido)
6. Backend genera guía y código de tracking
7. Backend publica evento de nuevo envío
8. Notification Service envía correo (asíncrono)
9. Frontend muestra confirmación con código

---

### **06 — Diagrama de Componentes: Sistema de Seguridad**
📄 [`06-componentes-seguridad.md`](docs/diagramas/06-componentes-seguridad.md)

Representa la arquitectura de seguridad completa:
- Componentes: IUI, IAPI, IAuth, INotificaciones, IData, IStorage
- Comunicación entre componentes
- Capas de seguridad (HTTPS, JWT, RBAC, Validación)
- Flujo completo de seguridad
- Despliegue con Docker Compose

**Componentes:**
- **IUI:** React Frontend
- **IAPI:** Express Backend + Nginx Gateway
- **IAuth:** JWT + Bcrypt
- **INotificaciones:** Nodemailer
- **IData:** MySQL + Sequelize
- **IStorage:** Almacenamiento de archivos
- **Redis:** Caché y blacklist JWT

---

## 🛠️ Stack Tecnológico

### Frontend
```
React.js + TypeScript        Framework y lenguaje
Vite                         Bundler (HMR optimizado)
Tailwind CSS                 Estilos utilitarios
Axios                        Cliente HTTP
React Router                 Enrutamiento client-side
Context API                  Gestión de estado
```

### Backend
```
Node.js + Express.js         Runtime y framework
Nginx                        API Gateway / Reverse Proxy
JWT (jsonwebtoken)           Autenticación
Bcrypt                       Encriptación de contraseñas
Sequelize                    ORM para MySQL
PDFKit / pdfmake             Generación de reportes PDF
Nodemailer                   Envío de correos
dotenv                       Gestión de variables de entorno
```

### Base de Datos
```
MySQL                        BD relacional principal
Sequelize Migrations         Versionado de esquema
Redis                        Caché y blacklist JWT
```

### DevOps
```
Docker                       Contenerización
Docker Compose               Orquestación de contenedores
```

### APIs Externas
```
RENIEC                       Validación de DNI (HTTPS)
Gmail/SendGrid (Nodemailer)  Envío de correos
```

---

## 🏗️ Arquitectura del Sistema

### Arquitectura por Capas (Backend)

```
┌─────────────────────────────────┐
│   Capa Presentación             │
│   (Controllers, Routes, Express)│
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Capa Aplicación               │
│   (Services, Lógica Negocio)   │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Capa Dominio                  │
│   (Entidades, Reglas Negocio)  │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Capa Datos                    │
│   (Repositories, Sequelize ORM) │
└─────────────────────────────────┘
```

### Arquitectura de Componentes

```
[Interfaz Web: React]
        ↓ HTTPS
[API Gateway: Nginx]
        ↓
[Backend: Express.js]
   ├─ Auth Service (JWT + Bcrypt)
   ├─ Shipment Service
   ├─ User Service
   ├─ Notification Service
   └─ Report Service
        ↓
   ├─ MySQL Database
   ├─ Redis Cache
   └─ File Storage
```

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos

```bash
# Node.js (v18.x o superior)
node --version

# npm o yarn
npm --version

# Docker y Docker Compose
docker --version
docker-compose --version

# MySQL 8.0 (si se instala localmente)
mysql --version
```

### Instalación y Configuración

#### 1. Clonar Repositorio

```bash
git clone https://github.com/usuario/rutasync.git
cd rutasync
```

#### 2. Configurar Variables de Entorno

```bash
# Backend
cp backend/.env.example backend/.env

# Editar backend/.env con valores reales:
# JWT_SECRET=super_secret_key_min_32_chars
# DB_HOST=mysql
# DB_NAME=rutasync_db
# SMTP_HOST=smtp.gmail.com
# RENIEC_API_KEY=...

# Frontend
cp frontend/.env.example frontend/.env

# Editar frontend/.env:
# VITE_API_URL=http://localhost:3001/api
```

#### 3. Levantar Contenedores

```bash
# Desde raíz del proyecto
docker-compose up -d

# Esperar a que MySQL esté listo (~30 segundos)
docker-compose logs mysql | grep "ready for connections"
```

#### 4. Ejecutar Migraciones

```bash
# Desde dentro del contenedor backend
docker-compose exec backend npm run migrate

# O crear datos iniciales (seeder)
docker-compose exec backend npm run seed
```

#### 5. Acceder a la Aplicación

```
Frontend:  http://localhost:3000
Backend:   http://localhost:3001/api
Adminer:   http://localhost:8080  (administración MySQL)
```

#### 6. Credenciales de Prueba

```
Email:     admin@rutasync.com
Contraseña: Admin123!
Rol:       ADMIN

Email:     operario@rutasync.com
Contraseña: Operario123!
Rol:       OPERARIO
```

---

## 📂 Estructura de Carpetas

```
rutasync/
├── docs/
│   ├── diagramas/
│   │   ├── 01-casos-de-uso.md
│   │   ├── 02-diagrama-clases-frontend.md
│   │   ├── 03-diagrama-clases-backend.md
│   │   ├── 04-secuencia-login-jwt.md
│   │   ├── 05-secuencia-registro-envio.md
│   │   └── 06-componentes-seguridad.md
│   └── README.md (este archivo)
│
├── frontend/                       # React + TypeScript
│   ├── src/
│   │   ├── pages/                 # Componentes de página
│   │   ├── components/            # Componentes reutilizables
│   │   ├── services/              # Servicios (Auth, API, etc.)
│   │   ├── types/                 # Interfaces TypeScript
│   │   ├── hooks/                 # Custom hooks
│   │   └── App.tsx
│   ├── public/
│   ├── .env.example
│   └── package.json
│
├── backend/                        # Node.js + Express
│   ├── src/
│   │   ├── presentation/
│   │   │   ├── controllers/       # Manejadores de rutas
│   │   │   ├── routes/            # Definición de rutas
│   │   │   └── middlewares/       # Auth, validación, error
│   │   ├── application/
│   │   │   └── services/          # Lógica de negocio
│   │   ├── domain/
│   │   │   ├── models/            # Entidades
│   │   │   ├── repositories/      # Interfaces de acceso
│   │   │   └── services/          # Servicios de dominio
│   │   ├── data/
│   │   │   ├── models/            # Modelos Sequelize
│   │   │   ├── repositories/      # Implementación acceso datos
│   │   │   ├── migrations/        # Migraciones BD
│   │   │   └── seeders/           # Datos iniciales
│   │   ├── shared/
│   │   │   ├── utils/             # Utilidades
│   │   │   └── events/            # Emisor de eventos
│   │   ├── config/
│   │   │   ├── env.js             # Configuración variables
│   │   │   ├── database.js        # Conexión Sequelize
│   │   │   └── dependencies.js    # Inyección de dependencias
│   │   ├── app.js                 # Configuración Express
│   │   └── server.js              # Punto de entrada
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml             # Orquestación de contenedores
├── .gitignore
└── README.md
```

---

## ✅ Requerimientos Funcionales

### Módulo de Administración (Panel Privado)

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-01 | Autenticación segura con JWT | Alta |
| RF-02 | Cierre de sesión e invalidación de token | Alta |
| RF-03 | Registro de envío con validación DNI (RENIEC) | Alta |
| RF-04 | Generación automática de código de tracking | Alta |
| RF-05 | Gestión de estados logísticos (secuencial unidireccional) | Alta |
| RF-06 | Historial completo de cambios de estado | Media |
| RF-07 | Gestión de roles y control de acceso | Alta |
| RF-08 | CRUD completo de entidades (envíos, usuarios, sucursales) | Alta |
| RF-09 | Generación de reportes PDF | Alta |
| RF-10 | Notificaciones por correo automáticas | Media |

### Módulo de Tracking Público

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-11 | Búsqueda pública sin autenticación | Alta |
| RF-12 | Representación visual con barra de progreso | Alta |
| RF-13 | Manejo de códigos inválidos con mensajes claros | Alta |

---

## 🔒 Requerimientos No Funcionales

| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF-01 | Frontend | SPA con React + TypeScript, Vite bundler, Tailwind CSS |
| RNF-02 | Backend | API REST con Node.js + Express, Nginx gateway |
| RNF-03 | Base de Datos | MySQL relacional con Sequelize ORM |
| RNF-04 | Seguridad | JWT + Bcrypt, HTTPS, Variables sensibles en .env |
| RNF-05 | Despliegue | Docker Compose para portabilidad |
| RNF-06 | Rendimiento | Respuestas < 2s (admin), < 1s (tracking público) |
| RNF-07 | Escalabilidad | Arquitectura por capas, índices DB optimizados |
| RNF-08 | Usabilidad | Interfaz intuitiva, mensajes claros, validación en tiempo real |

---

## 🔐 Seguridad

### Implementaciones de Seguridad

✅ **Autenticación JWT:** Tokens firmados con secret, expiración 24h  
✅ **Encriptación de Contraseñas:** Bcrypt con 10 rounds  
✅ **Comunicación HTTPS:** TLS/SSL en tránsito  
✅ **RBAC:** Role-Based Access Control (ADMIN, OPERARIO)  
✅ **Validación de Entrada:** Sanitización en frontend y backend  
✅ **Protección contra XSS:** React escapa automáticamente  
✅ **Protección contra CSRF:** Validación de origen CORS  
✅ **Logs de Auditoría:** Registro de quién hizo qué y cuándo  
✅ **Variables Sensibles:** Nunca expuestas en código fuente  
✅ **API RENIEC HTTPS:** Validación de DNI vía comunicación segura  

---

## 📊 Flujos de Datos Principales

### Flujo: Login y Autenticación

```
Usuario → Frontend → [Email + Contraseña] 
        → POST /api/auth/login 
        → Backend valida Bcrypt 
        → Genera JWT 
        → Frontend almacena localStorage 
        → ✅ Autenticado
```

### Flujo: Registro de Envío

```
Operario → Frontend → [Datos Envío]
        → POST /api/shipments + JWT
        → Backend valida DNI (RENIEC)
        → Crea registro + genera tracking
        → Publica evento (asíncrono)
        → Notification Service envía correo
        → ✅ Envío creado
```

### Flujo: Actualización de Estado

```
Operario → Frontend → [Selecciona nuevo estado]
        → PATCH /api/shipments/{id}/estado
        → Backend valida transición
        → Crea registro HistorialEstado
        → Publica evento
        → Notification Service envía correo
        → ✅ Estado actualizado
```

### Flujo: Consulta Pública de Tracking

```
Cliente Público → Frontend → [Código tracking]
               → GET /api/tracking/{codigo} (Sin JWT)
               → Backend retorna datos envío
               → Frontend muestra barra progreso
               → ✅ Estado visible
```

---

## 🧪 Testing

### Backend (Jest + Supertest)

```bash
npm run test              # Ejecutar todos los tests
npm run test:watch       # Modo watch
npm run test:coverage    # Cobertura
```

### Frontend (Vitest)

```bash
npm run test              # Ejecutar tests
npm run test:watch       # Modo watch
npm run test:ui          # Interfaz visual
```

---

## 📈 Monitoreo y Logs

### Logs del Backend

```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Filtrar por nivel
docker-compose logs backend | grep ERROR
```

### Métrica de Rendimiento

```bash
# Tiempo de respuesta
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/health

# Verificar estado
curl http://localhost:3001/api/health
```

---

## 🤝 Contribución

1. Crear rama: `git checkout -b feature/descripcion`
2. Hacer cambios
3. Commit: `git commit -m "feat: descripcion"`
4. Push: `git push origin feature/descripcion`
5. Pull Request

---

## 📄 Licencia

Proyecto educativo - SENATI 2026

---

## ✉️ Contacto

**Autor:** Ebert Alonso Valdez Reyes  
**Email:** ebert@rutasync.com  
**Institución:** SENATI — Dirección Zonal Arequipa-Puno

---

## 📝 Changelog

### v2.0 (2026-05-10)
- Documentación completa de diagramas
- Arquitectura por capas finalizada
- Modelos de datos definidos
- Flujos de seguridad especificados

### v1.0 (2026-04-20)
- Documento de requerimientos inicial
- Diagramas UML
- Especificación de casos de uso

---

## 🔗 Enlaces Útiles

- 📄 [Requerimientos Completos](RutaSync_Requerimientos_Copilot.md)
- 📂 [Documentación de Diagramas](docs/diagramas/)
- 🐳 [Docker Compose Reference](https://docs.docker.com/compose/)
- 🔒 [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- 📚 [React Documentation](https://react.dev)
- 🛠️ [Express.js Guide](https://expressjs.com/)

---

**Última actualización:** 10 de mayo de 2026

Este documento serve como guía maestra del sistema RutaSync. Para detalles específicos de cada diagrama, consulta la documentación en `docs/diagramas/`.
