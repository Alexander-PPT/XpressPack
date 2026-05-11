# Diagrama de Secuencia: Login y Autenticación JWT

**Archivo de referencia:** `Diagrama_de_secuencia_para_autenticación_JWT.png`

---

## 📊 Descripción General

Este diagrama muestra la **secuencia completa de autenticación JWT** en RutaSync. Detalla las interacciones entre el Usuario, Frontend (React), Nginx (API Gateway), Servidor Express (Auth Service), Base de Datos MySQL, y Redis (para invalidación de tokens).

---

## 🔐 Flujo Detallado de Autenticación

### **Participantes del Flujo**

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Usuario    │    │   Frontend   │    │   API Gateway│    │  Auth Service│    │   MySQL DB   │
│              │    │   (React)    │    │    (Nginx)   │    │ (Node/Express)     │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                  │                     │                  │                     │
       └──────────────────┼─────────────────────┼──────────────────┼─────────────────────┘
                Secuencia de interacción temporal (de arriba hacia abajo)
```

---

## 📋 Pasos del Flujo

### **Paso 1: Usuario Ingresa Credenciales**

**Actor:** Usuario (persona)

```
Usuario interactúa con interfaz de login del Frontend (React)
Ingresa:
  - Email: ebert@rutasync.com
  - Contraseña: MiContraseña123!
```

**Renderizado Frontend:**
```jsx
// LoginPage.tsx
<form onSubmit={handleSubmit}>
  <input type="email" name="email" placeholder="Email" />
  <input type="password" name="password" placeholder="Contraseña" />
  <button type="submit">Iniciar Sesión</button>
</form>
```

---

### **Paso 2: Frontend Envía Solicitud POST**

**Actor:** Frontend (React)

```
Solicitud HTTP:
  Método: POST
  URL: /api/auth/login
  Headers:
    Content-Type: application/json
  
  Body (JSON):
  {
    "email": "ebert@rutasync.com",
    "password": "MiContraseña123!"
  }
```

**Código Frontend:**
```typescript
// AuthService.ts
async login(email: string, password: string): Promise<User> {
  const response = await apiService.post('/api/auth/login', {
    email,
    password
  });
  
  const { token, user } = response.data;
  
  // Almacena JWT en localStorage
  storageService.saveToken(token);
  storageService.saveUser(user);
  
  return user;
}
```

---

### **Paso 3: API Gateway (Nginx) Reenvía Solicitud**

**Actor:** Nginx (proxy inverso)

```
Nginx recibe solicitud en puerto 3000
Valida que sea POST a /api/auth/login
Reenvía a backend (Node.js) en localhost:3001
No modifica request en este punto
```

**Configuración Nginx (nginx.conf):**
```nginx
server {
  listen 3000;
  server_name localhost;
  
  location /api/ {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

### **Paso 4: Auth Service Recibe Solicitud**

**Actor:** Backend (Node.js/Express)

```
Express recibe POST /api/auth/login en puerto 3001
Router: POST /api/auth/login → Controller: loginController
Controller extrae datos del request body:
  - email: "ebert@rutasync.com"
  - password: "MiContraseña123!"
```

**Código Backend:**
```javascript
// presentation/controllers/auth.controller.js
async function loginController(req, res, next) {
  try {
    const { email, password } = req.body;
    
    // Valida entrada
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email y contraseña son requeridos' 
      });
    }
    
    // Delega a AuthService
    const result = await authService.authenticate(email, password);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
```

---

### **Paso 5: Auth Service Solicita Usuario a MySQL**

**Actor:** Backend (Auth Service)

```
Auth Service envía query a MySQL:
  SELECT * FROM usuarios WHERE email = 'ebert@rutasync.com'
```

**Código Backend:**
```javascript
// application/services/auth.service.js
async function authenticate(email, password) {
  // Consulta usuario en BD
  const usuario = await usuarioRepository.findByEmail(email);
  
  if (!usuario) {
    throw new AuthenticationError('Email o contraseña incorrectos');
  }
  
  // Continúa con validación de contraseña
  return usuario;
}

// data/repositories/usuario.repository.js
async function findByEmail(email) {
  return await Usuario.findOne({
    where: { email }
  });
}
```

---

### **Paso 6: MySQL Retorna Datos del Usuario**

**Actor:** Base de Datos (MySQL)

```
MySQL ejecuta query y retorna:
{
  "id": "uuid-123",
  "nombre": "Ebert Valdez",
  "email": "ebert@rutasync.com",
  "passwordHash": "$2b$10$..." (hash Bcrypt),
  "rol": 1 (ADMIN),
  "sucursalId": "uuid-sucu1",
  "estado": true,
  "creadoEn": "2026-05-01T10:00:00Z",
  "actualizadoEn": "2026-05-10T15:30:00Z"
}
```

---

### **Paso 7: Backend Valida Contraseña**

**Actor:** Backend (Bcrypt)

```
Auth Service compara:
  Entrada: "MiContraseña123!" (texto plano)
  Hash: "$2b$10$..." (almacenado en BD)
  
Resultado: ✓ Contraseña válida (Bcrypt.compare retorna true)
```

**Código Backend:**
```javascript
// application/services/auth.service.js
async function authenticate(email, password) {
  const usuario = await usuarioRepository.findByEmail(email);
  
  if (!usuario) {
    throw new AuthenticationError('Email o contraseña incorrectos');
  }
  
  // Valida contraseña con Bcrypt
  const esValida = await bcrypt.compare(password, usuario.passwordHash);
  
  if (!esValida) {
    throw new AuthenticationError('Email o contraseña incorrectos');
  }
  
  // Continúa generando JWT
  return usuario;
}
```

---

### **Paso 8: Backend Genera JWT**

**Actor:** Backend (jsonwebtoken)

```
Auth Service genera JWT con payload:
{
  "sub": "uuid-123",           // Usuario ID (subject)
  "email": "ebert@rutasync.com",
  "rol": "ADMIN",
  "iat": 1715424600,           // Issued At (timestamp)
  "exp": 1715511000            // Expires (24 horas después)
}

Firmado con secret: "super_secret_key_$2025"
Resultado JWT:
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
  eyJzdWIiOiJ1dWlkLTEyMyIsImVtYWlsIjoiZWJlcnRAcnV0YXN5bmMuY29tIiwi...
  SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Código Backend:**
```javascript
// application/services/auth.service.js
async function generateJWT(usuario) {
  const payload = {
    sub: usuario.id,
    email: usuario.email,
    rol: usuario.rol.nombre,
    sucursalId: usuario.sucursalId
  };
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,      // Secret desde .env
    { expiresIn: '24h' }          // Expiración: 24 horas
  );
  
  return token;
}
```

---

### **Paso 9 (Opcional): Almacena Token en Redis (Blacklist)**

**Actor:** Backend (Redis)

```
(Este paso es OPCIONAL, solo si se implementa blacklist para logout)

Auth Service puede almacenar token en Redis:
  Key: "blacklist:{token_id}"
  Value: "1"
  TTL: 24h (igual que expiración JWT)

Propósito: Permitir revocación inmediata al hacer logout
```

**Código Backend (Opcional):**
```javascript
// application/services/redis.service.js
async function addTokenToBlacklist(token, expiresIn) {
  const decoded = jwt.decode(token);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000); // Segundos restantes
  
  await redis.setex(
    `blacklist:${decoded.sub}`,
    ttl,
    '1'
  );
}
```

---

### **Paso 10: Backend Retorna JWT**

**Actor:** Backend (Express)

```
Respuesta HTTP:
  Status: 200 OK
  Headers:
    Content-Type: application/json
  
  Body (JSON):
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGc...",
      "usuario": {
        "id": "uuid-123",
        "nombre": "Ebert Valdez",
        "email": "ebert@rutasync.com",
        "rol": "ADMIN"
      }
    }
  }
```

**Código Backend:**
```javascript
// presentation/controllers/auth.controller.js
async function loginController(req, res, next) {
  const usuario = await authService.authenticate(email, password);
  const token = await authService.generateJWT(usuario);
  
  res.status(200).json({
    success: true,
    data: {
      accessToken: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre
      }
    }
  });
}
```

---

### **Paso 11: API Gateway Reenvía Respuesta**

**Actor:** Nginx

```
Nginx recibe respuesta de backend (3001)
La reenvía al cliente Frontend en puerto 3000
Sin modificaciones
```

---

### **Paso 12: Frontend Almacena JWT**

**Actor:** Frontend (React)

```
Frontend recibe respuesta 200 OK
Extrae token: "eyJhbGc..."
Almacena en localStorage:
  localStorage.setItem('authToken', 'eyJhbGc...')
  localStorage.setItem('user', JSON.stringify({...}))

El JWT ahora estará disponible para futuras solicitudes
```

**Código Frontend:**
```typescript
// AuthService.ts
async login(email: string, password: string): Promise<User> {
  const response = await apiService.post('/api/auth/login', {
    email,
    password
  });
  
  const { accessToken, usuario } = response.data.data;
  
  // Almacena en localStorage
  storageService.saveToken(accessToken);
  storageService.saveUser(usuario);
  
  return usuario;
}

// StorageService.ts
saveToken(token: string): void {
  localStorage.setItem('authToken', token);
}

saveUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}
```

---

## 📍 Uso del JWT en Solicitudes Posteriores

Una vez autenticado, **todas las solicitudes posteriores** deben incluir el JWT en el header:

```
GET /api/shipments
Authorization: Bearer eyJhbGc...
```

**Código Frontend (Interceptor Axios):**
```typescript
// ApiService.ts
setupInterceptors(): void {
  this.axiosInstance.interceptors.request.use((config) => {
    const token = storageService.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  });
}
```

**Código Backend (Middleware de Autenticación):**
```javascript
// presentation/middlewares/auth.middleware.js
async function authenticateMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado o inválido'
    });
  }
  
  const token = authHeader.substring(7); // Extrae token sin "Bearer "
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // (Opcional) Valida que token no esté en blacklist
    const isBlacklisted = await redisService.isTokenBlacklisted(decoded.sub);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token ha sido invalidado'
      });
    }
    
    req.usuario = decoded; // Adjunta usuario decodificado al request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
}
```

---

## 🔒 Configuración de Seguridad

### **JWT Secret (Variables de Entorno)**

```bash
# .env
JWT_SECRET=super_secret_key_$2025_min_32_chars
JWT_EXPIRES_IN=24h
NODE_ENV=production
```

⚠️ **Nunca exponer JWT_SECRET en código fuente**

---

### **Bcrypt Configuration**

```javascript
// config/bcrypt.js
const SALT_ROUNDS = 10;

// Al crear usuario:
const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Al autenticar:
const esValida = await bcrypt.compare(plainPassword, passwordHash);
```

---

## 🚪 Cierre de Sesión (Logout)

### **Flujo de Logout**

```
1. Usuario hace clic en "Cerrar Sesión"
2. Frontend envía: DELETE /api/auth/logout + JWT en header
3. Backend valida JWT
4. Backend agrega token a Redis blacklist (opcional)
5. Frontend elimina JWT de localStorage
6. Frontend redirige a /login
```

**Código Backend:**
```javascript
// presentation/controllers/auth.controller.js
async function logoutController(req, res, next) {
  try {
    const token = req.headers.authorization?.substring(7);
    
    if (token) {
      // Agrega a blacklist
      await redisService.addTokenToBlacklist(token);
    }
    
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    next(error);
  }
}
```

---

## ⚠️ Casos de Error Comunes

| Error | Código HTTP | Mensaje | Acción |
|-------|-------------|---------|--------|
| Email no existe | 401 | "Email o contraseña incorrectos" | Redirige a login |
| Contraseña inválida | 401 | "Email o contraseña incorrectos" | Redirige a login |
| Usuario inactivo | 403 | "Usuario desactivado" | Muestra mensaje |
| JWT expirado | 401 | "Token expirado" | Redirige a login |
| JWT inválido | 401 | "Token inválido" | Redirige a login |
| Token en blacklist | 401 | "Token ha sido invalidado" | Redirige a login |

---

## 📊 Cronograma Temporal

```
Tiempo (ms)
0     ├─ Usuario ingresa credenciales
50    ├─ Frontend POST /api/auth/login
70    ├─ Nginx reenvía a backend
100   ├─ Backend recibe solicitud
110   ├─ Backend consulta MySQL
150   ├─ MySQL retorna usuario
160   ├─ Backend valida contraseña (Bcrypt)
200   ├─ Backend genera JWT
220   ├─ Backend (opcional) agrega a Redis
230   ├─ Backend retorna JWT
250   ├─ Nginx reenvía respuesta
280   ├─ Frontend almacena JWT
290   ├─ Frontend navega a Dashboard
300   └─ ✅ Login completado exitosamente
```

---

## 🔐 Mejores Prácticas Implementadas

1. **No exponer contraseñas:** Bcrypt hash
2. **Expiración de token:** 24 horas
3. **Firma de JWT:** Secret seguro
4. **Validación en servidor:** No confiar solo en cliente
5. **Blacklist (opcional):** Revocación inmediata de sesión
6. **HTTPS recomendado:** Proteger JWT en tránsito
7. **Validación de entrada:** Formato email y longitud contraseña
8. **Mensajes genéricos:** No revelar si email existe o contraseña es inválida

---

## 📝 Conclusión

El flujo de autenticación JWT en RutaSync garantiza:
- **Seguridad:** Bcrypt + JWT firmado + expiración
- **Escalabilidad:** Stateless (sin sesiones en servidor)
- **Revocabilidad:** Redis blacklist para logout efectivo
- **Trazabilidad:** Logs de intentos de login (opcional)

Este diagrama es la base del sistema de seguridad de RutaSync.
