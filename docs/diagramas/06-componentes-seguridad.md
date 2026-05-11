# Diagrama de Componentes — Sistema de Seguridad

**Archivo de referencia:** `Diagrama_de_componentes_-_Sistema_de_seguridad.png`

---

## 📊 Descripción General

El diagrama de componentes representa la arquitectura de seguridad de RutaSync, mostrando todos los servicios, sus responsabilidades, y las dependencias entre ellos. Define cómo se comunican la interfaz web, el API Gateway, los servicios de autenticación, las bases de datos, y los almacenamientos de archivos.

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│              ┌──────────────────────────────────┐            │
│              │  IUI (Interfaz de Usuario)       │            │
│              │  React + TypeScript              │            │
│              │  Tailwind CSS                    │            │
│              └──────────────────┬───────────────┘            │
│                                 │                             │
│                    HTTPS (comunicación asíncrona)            │
│                                 │                             │
│              ┌──────────────────▼───────────────┐            │
│              │      IAPI (API REST)             │            │
│              │  Express.js + Node.js            │            │
│              │  API Gateway (Nginx)             │            │
│              │  Microservicios                  │            │
│              └──────────────────┬───────────────┘            │
│                                 │                             │
│              ┌──────────────────┴─────────────────┐           │
│              │          │         │        │       │          │
│              │          │         │        │       │          │
│      ┌───────▼──┐  ┌───▼────┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐       │
│      │  IAuth   │  │INotif  │ │ IData │IStorage     │        │
│      │  (JWT)   │  │(Email) │ │(BD)  │ (Archivos)  │        │
│      └───────┬──┘  └───┬────┘ └──┬──┘ └──┬──┘       │        │
│              │         │        │      │       │            │
│              └─────────┼────────┼──────┼───────┘            │
│                        │        │      │                    │
│         ┌──────────────┴────────┘      │                    │
│         │                              │                    │
│    ┌────▼────────┐            ┌───────▼───────┐            │
│    │   Redis     │            │   MySQL       │            │
│    │  (Caché)    │            │   Database    │            │
│    │  (Blacklist)│            │               │            │
│    └─────────────┘            └───────────────┘            │
│                               └─────────────────────────────┘
```

---

## 🔧 Componentes Principales

### **1. IUI (Interfaz de Usuario)**

**Tecnología:** React.js + TypeScript

**Responsabilidades:**
- Renderizar interfaz de usuario para usuarios internos
- Capturar entrada de usuario (formularios)
- Realizar peticiones HTTP asincrónicas
- Almacenar JWT en localStorage
- Navegar entre vistas

**Características:**
- Single Page Application (SPA)
- Generación con Vite
- Estilos con Tailwind CSS
- Gestión de estado con Context API / Hooks
- Cliente HTTP con Axios

**Comunicación:**
```
→ HTTPS Request: POST /api/auth/login
← HTTPS Response: { token, usuario }
→ HTTPS Request: GET /api/shipments (con header Authorization)
← HTTPS Response: [shipments...]
```

---

### **2. IAPI (API Gateway & Servicios)**

**Tecnología:** Node.js + Express.js (Backend) + Nginx (Reverse Proxy)

**Componentes:**
- **Nginx:** Proxy inverso, balanceo de carga, validación SSL/TLS
- **Express:** Framework web, enrutamiento, middlewares
- **Controladores:** Manejan peticiones HTTP
- **Servicios:** Lógica de negocio
- **Repositorios:** Abstracción de acceso a datos

**Responsabilidades:**
- Recibir peticiones HTTP del frontend
- Validar JWT en headers
- Autorizar acciones según rol del usuario
- Ejecutar lógica de negocio
- Comunicarse con BD y servicios externos
- Retornar respuestas JSON

**Flujo Típico:**
```
1. Nginx recibe petición HTTPS
2. Valida SSL/TLS
3. Reenvía a Express (localhost:3001)
4. Express Router mapea a controlador
5. Controlador extrae datos y JWT
6. Middleware de autenticación valida JWT
7. Controlador delega a Service
8. Service ejecuta lógica
9. Service consulta Repository
10. Repository accede a MySQL
11. Respuesta fluye hacia arriba
12. Express retorna JSON
13. Nginx reenvía al cliente
```

---

### **3. IAuth (Servicio de Autenticación)**

**Tecnología:** jsonwebtoken + Bcrypt

**Responsabilidades:**
- Autenticar usuarios (email + contraseña)
- Encriptar contraseñas con Bcrypt
- Generar JWT
- Validar JWT en peticiones posteriores
- Revocar sesiones (logout)

**Flujo:**
```
Autenticación:
  1. Usuario envía email + contraseña
  2. Backend consulta usuario en MySQL
  3. Backend valida contraseña con Bcrypt
  4. Backend genera JWT con claims (id, email, rol)
  5. JWT firmado con secret desde .env
  6. Frontend almacena JWT
  
Autorización (en peticiones posteriores):
  1. Cliente envía JWT en header: Authorization: Bearer <token>
  2. Middleware valida JWT signature
  3. Middleware valida expiración
  4. Middleware valida token no esté en blacklist (Redis)
  5. Si válido, continúa ejecución
  6. Si inválido, retorna 401 Unauthorized
```

**Configuración Segura:**
```javascript
// config/jwt.js
const JWT_SECRET = process.env.JWT_SECRET;  // Mínimo 32 caracteres
const JWT_EXPIRY = '24h';                    // Expiración: 24 horas

// Generar JWT
const token = jwt.sign(
  { id: usuario.id, email: usuario.email, rol: usuario.rol },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRY }
);

// Validar JWT
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  // Token válido, decodificado contiene claims
} catch (error) {
  // Token inválido o expirado
}
```

---

### **4. INotificaciones (Servicio de Notificaciones)**

**Tecnología:** Nodemailer + SMTP

**Responsabilidades:**
- Enviar correos electrónicos automáticos
- Manejar cola de notificaciones pendientes
- Reintenta fallos con exponential backoff
- Registra estado de cada notificación

**Eventos que Disparan Notificaciones:**
```
1. Envío creado → Correo al destinatario
2. Estado cambiado → Correo al destinatario
3. Entrega exitosa → Correo de confirmación
4. Error o alerta → Correo de notificación
```

**Flujo:**
```
1. Shipment Service publica evento: 'shipment.created'
2. Notification Service escucha evento
3. Crea registro en tabla notificaciones (estado: PENDIENTE)
4. Genera contenido HTML
5. Configura transporte SMTP (Gmail, SendGrid, etc.)
6. Envía correo
7. Actualiza estado a ENVIADO con timestamp
8. Si falla: Registra error, programa reintentos
```

**Configuración SMTP:**
```javascript
// config/email.js
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,        // smtp.gmail.com
  port: process.env.SMTP_PORT,        // 587
  secure: true,                        // TLS
  auth: {
    user: process.env.SMTP_USER,      // email@gmail.com
    pass: process.env.SMTP_PASSWORD   // app-password
  }
});

// Enviar correo
await transporter.sendMail({
  from: 'no-reply@rutasync.com',
  to: destinatario.email,
  subject: 'Tu envío ha sido registrado',
  html: '<h2>¡Hola!</h2><p>Tu paquete está en camino.</p>'
});
```

---

### **5. IData (Base de Datos Relacional)**

**Tecnología:** MySQL + Sequelize ORM

**Responsabilidades:**
- Almacenar datos de usuarios, envíos, estados, historial
- Mantener integridad referencial
- Indexación para rendimiento
- Migraciones versionadas

**Tablas Principales:**
```
- usuarios (autenticación)
- rol_usuarios (catálogo de roles)
- sucursales (ubicaciones logísticas)
- envios (paquetes)
- estado_envios (catálogo de estados)
- historial_estados (trazabilidad)
- notificaciones (registros de correos)
```

**Conexión:**
```javascript
// config/database.js
const sequelize = new Sequelize(
  process.env.DB_NAME,      // rutasync_db
  process.env.DB_USER,      // root
  process.env.DB_PASSWORD,  // contraseña
  {
    host: process.env.DB_HOST,  // localhost
    port: process.env.DB_PORT,  // 3306
    dialect: 'mysql',
    logging: false
  }
);

// Autenticar conexión
await sequelize.authenticate();
```

---

### **6. IStorage (Almacenamiento de Archivos)**

**Tecnología:** Servidor local o Cloud Storage (AWS S3, Google Cloud)

**Responsabilidades:**
- Almacenar reportes PDF generados
- Almacenar documentos subidos
- Servir archivos estáticos (HTML, CSS, JS)
- Gestionar limpiezade archivos temporales

**Casos de Uso:**
```
1. Generar reporte PDF → Almacenar en servidor
2. Cliente descarga → Servir archivo
3. Eliminar reporte después de 7 días → Cleanup automático
```

**Ejemplo:**
```javascript
// services/report.service.js
async function generarReporte(filtros) {
  const pdf = await pdfmake.create(datos);
  
  // Guarda temporalmente
  const filename = `reporte_${Date.now()}.pdf`;
  const filepath = path.join('/var/www/uploads', filename);
  
  fs.writeFileSync(filepath, pdf);
  
  // Retorna URL para descarga
  return `/descargas/${filename}`;
}
```

---

### **7. Redis (Caché y Blacklist)**

**Tecnología:** Redis (base de datos en memoria)

**Responsabilidades:**
- Almacenar blacklist de JWT invalidados
- Caché de consultas frecuentes
- Sesiones de usuario
- Rate limiting

**Casos de Uso:**

**Blacklist de JWT (Logout):**
```javascript
// Al hacer logout:
const decoded = jwt.decode(token);
const ttl = decoded.exp - Math.floor(Date.now() / 1000);

redis.setex(`blacklist:${decoded.sub}`, ttl, '1');

// Al validar JWT en petición posterior:
const isBlacklisted = await redis.get(`blacklist:${decoded.sub}`);
if (isBlacklisted) {
  throw new AuthenticationError('Token ha sido invalidado');
}
```

**Caché de Sucursales:**
```javascript
// Primera consulta:
const sucursales = await mysql.query('SELECT * FROM sucursales');
redis.setex('sucursales:list', 3600, JSON.stringify(sucursales));

// Consultas posteriores (1 hora):
const cached = await redis.get('sucursales:list');
if (cached) {
  return JSON.parse(cached);
}
```

---

## 🔐 Flujo Completo de Seguridad

### **Escenario: Usuario Autenticado Crea Envío**

```
1. USUARIO INGRESA CREDENCIALES
   └─ Frontend (IUI)

2. FRONTEND ENVÍA LOGIN
   └─ HTTPS → POST /api/auth/login
   
3. NGINX VALIDA SSL/TLS
   └─ Reverse proxy reenvía a Express

4. EXPRESS RECIBE PETICIÓN
   └─ IAPI procesa autenticación

5. IAUTH VALIDA CREDENCIALES
   ├─ Consulta IData (MySQL)
   ├─ Valida contraseña con Bcrypt
   └─ Genera JWT

6. FRONTEND ALMACENA JWT
   └─ localStorage.setItem('authToken', token)

7. USUARIO REGISTRA ENVÍO
   └─ Frontend envía: POST /api/shipments + JWT

8. EXPRESS RECIBE PETICIÓN
   └─ IAPI extrae JWT del header

9. IAUTH VALIDA JWT
   ├─ Verifica signature
   ├─ Verifica expiración
   └─ Consulta Redis blacklist
   
10. SI VÁLIDO: CONTINÚA
    └─ Middleware autentica usuario

11. IAPI VALIDA AUTORIZACIÓN
    └─ Verifica rol (OPERARIO o ADMIN)

12. IAPI PROCESA LÓGICA DE NEGOCIO
    ├─ Valida DNI vía API RENIEC
    ├─ Crea registro en IData
    └─ Publica evento

13. INOTIFICACIONES PROCESA EVENTO
    └─ Envía correo al destinatario

14. RESPUESTA RETORNA AL CLIENTE
    └─ HTTPS ← 201 Created + datos envío

✅ Envío creado, notificaciones enviadas, trazabilidad registrada
```

---

## 🛡️ Capas de Seguridad

```
┌───────────────────────────────────────┐
│ 1. COMUNICACIÓN (HTTPS/TLS)           │
│    - Encriptación en tránsito          │
│    - Previene eavesdropping            │
└───────────────────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│ 2. AUTENTICACIÓN (JWT)                │
│    - Valida quién eres                 │
│    - Token firmado criptográficamente  │
└───────────────────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│ 3. AUTORIZACIÓN (RBAC)                │
│    - Valida qué puedes hacer           │
│    - Roles: ADMIN, OPERARIO            │
└───────────────────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│ 4. VALIDACIÓN DE ENTRADA              │
│    - Sanitización de datos             │
│    - Previene SQL injection, XSS       │
└───────────────────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│ 5. ENCRIPTACIÓN DE DATOS              │
│    - Bcrypt para contraseñas           │
│    - Datos sensibles encriptados       │
└───────────────────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│ 6. AUDITORÍA                          │
│    - Registra quién hizo qué           │
│    - Historial inmutable               │
└───────────────────────────────────────┘
```

---

## 📊 Resumen de Responsabilidades

| Componente | Responsabilidad | Tecnología |
|------------|-----------------|-----------|
| **IUI** | Presentación | React + TypeScript |
| **IAPI** | Lógica y enrutamiento | Express.js |
| **IAuth** | Autenticación y autorización | JWT + Bcrypt |
| **INotificaciones** | Correos automáticos | Nodemailer |
| **IData** | Persistencia de datos | MySQL + Sequelize |
| **IStorage** | Almacenamiento archivos | Servidor/S3 |
| **Redis** | Caché y blacklist | Redis |

---

## 🚀 Despliegue con Docker

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:latest
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - frontend

  frontend:
    build: ./frontend
    ports: ["3000:80"]

  backend:
    build: ./backend
    ports: ["3001:3001"]
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    ports: ["3306:3306"]
    environment:
      - MYSQL_DATABASE=rutasync_db
      - MYSQL_ROOT_PASSWORD=${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:latest
    ports: ["6379:6379"]
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

---

## 📝 Conclusión

El diagrama de componentes muestra cómo RutaSync integra múltiples sistemas en una arquitectura segura y escalable:
- **Frontend** renderiza interfaz
- **API Gateway** centraliza comunicación
- **Servicios** ejecutan lógica
- **Autenticación** protege acceso
- **Notificaciones** mantienen informado al usuario
- **Base de datos** persiste datos
- **Almacenamiento** gestiona archivos
- **Caché** optimiza rendimiento

Todos estos componentes trabajan conjuntamente bajo principios de **seguridad en capas** y **separación de responsabilidades**.
