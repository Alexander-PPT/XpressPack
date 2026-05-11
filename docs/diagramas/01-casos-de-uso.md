# Diagrama de Casos de Uso — Sistema RutaSync

**Archivo de referencia:** `Diagrama_de_Casos_de_Uso_RutaSync.png`

---

## 📊 Descripción General

El diagrama de casos de uso representa todas las interacciones posibles entre los **tres actores del sistema** y el sistema RutaSync. Define de forma clara qué funcionalidades está autorizado cada actor a realizar, estableciendo los límites funcionales del sistema y las dependencias entre casos de uso mediante relaciones de inclusión (`<<include>>`) y extensión.

---

## 🎭 Actores del Sistema

### 1. **Cliente Público** (No Autenticado)
- **Tipo de acceso:** Público, sin autenticación
- **Representación:** Figura de persona genérica fuera del límite del sistema
- **Responsabilidad:** Consultar el estado de su paquete mediante un código de tracking

### 2. **Operario** (Usuario Interno Autenticado)
- **Tipo de acceso:** Interno, requiere autenticación JWT
- **Representación:** Figura de persona con rol asignado
- **Responsabilidad:** Registrar envíos, actualizar estados logísticos, consultar historial
- **Restricción:** No puede crear usuarios ni generar reportes

### 3. **Administrador** (Usuario Interno Autenticado)
- **Tipo de acceso:** Interno, requiere autenticación JWT
- **Representación:** Figura de persona con rol superior
- **Responsabilidad:** Acceso total — gestión de envíos, usuarios, sucursales y generación de reportes
- **Diferencia con Operario:** Tiene acceso a funcionalidades administrativas exclusivas

---

## 📋 Casos de Uso Principales

### **CU-01: Consultar Tracking de Envío** [Consulta Pública]

```
Actor: Cliente Público (sin autenticación)
Descripción: El cliente accede a la landing page pública y busca el estado de su paquete
Precondiciones: El código de tracking existe en la base de datos
Flujo Principal:
  1. Cliente accede a la landing page de tracking
  2. Cliente ingresa código de tracking único
  3. Sistema valida el código en la base de datos (sin autenticación)
  4. Sistema muestra tarjeta de resultado con barra de progreso (Recibido/En Viaje/Entregado)
Postcondiciones: El cliente visualiza el estado y datos del envío
Casos Alternativos:
  - Si el código es inválido → Sistema muestra mensaje de error amigable
```

**Características de Implementación:**
- Endpoint público sin protección JWT: `GET /api/tracking/:codigo`
- Búsqueda asíncrona sin recargar página (SPA)
- Representación visual dinámica con barra de progreso

---

### **CU-02: Iniciar Sesión** [Autenticación JWT]

```
Actor: Operario, Administrador
Descripción: El usuario interno se autentica mediante credenciales
Precondiciones: El usuario existe y está activo en el sistema
Flujo Principal:
  1. Usuario accede a la página de login del panel administrativo
  2. Usuario ingresa email y contraseña
  3. Sistema valida credenciales contra base de datos
  4. Sistema genera JWT con claims del usuario (id, email, rol)
  5. Sistema devuelve JWT al cliente
  6. Cliente almacena JWT en localStorage/cookie
Postcondiciones: Usuario autenticado, JWT válido almacenado en cliente
Excepciones:
  - Email no existe → Error de validación
  - Contraseña incorrecta → Error de validación
  - Usuario inactivo → Error de autorización
```

**Características de Implementación:**
- Endpoint: `POST /api/auth/login`
- JWT firmado con secret, expira en (configurable, ej: 24h)
- Bcrypt para validación de contraseña
- Redis para invalidación (opcional, lista negra)

---

### **CU-03: Registrar Nuevo Envío** [Operación Interna]

```
Actor: Operario, Administrador
Incluye: Iniciar Sesión (precondición)
Descripción: Registra un nuevo paquete en el sistema con validación de DNI
Precondiciones: Usuario autenticado con rol Operario o superior
Flujo Principal:
  1. Usuario accede al formulario "Registrar Nuevo Envío"
  2. Usuario completa campos: DNI remitente, nombre, DNI destinatario, nombre,
     sucursal origen, sucursal destino, peso, dimensiones, tipo de servicio, descripción
  3. Sistema valida formato de datos (frontend y backend)
  4. Sistema envía DNI del destinatario a API RENIEC (HTTPS)
  5. API RENIEC retorna validación (válido/inválido)
  6. Sistema almacena envío con estado inicial "Recibido"
  7. Sistema genera código de tracking único (alfanumérico)
  8. Sistema publica evento de nuevo envío
  9. Sistema retorna confirmación con código de tracking
Postcondiciones: Envío registrado en BD, código generado, evento publicado
Excepciones:
  - DNI inválido → Error de validación, no se registra
  - Datos incompletos → Error de validación
  - API RENIEC no disponible → Permitir registro manual (fallback)
```

**Características de Implementación:**
- Endpoint: `POST /api/shipments`
- Validación en dos niveles: Frontend (experiencia UX) + Backend (seguridad)
- Integración con API RENIEC (validación de DNI)
- Generación automática de guía y código de tracking único
- Publicación de evento para procesamiento asíncrono (notificaciones)

---

### **CU-04: Actualizar Estado Logístico** [Operación Interna]

```
Actor: Operario, Administrador
Incluye: Iniciar Sesión
Descripción: Transiciona un envío al siguiente estado logístico
Precondiciones: 
  - Usuario autenticado
  - Envío existe y no está en estado final (Entregado)
Flujo Principal:
  1. Usuario visualiza tabla de envíos con estado actual
  2. Usuario selecciona un envío
  3. Usuario elige siguiente estado (lista restringida según flujo)
  4. Sistema valida que el nuevo estado es válido según flujo secuencial
  5. Sistema actualiza estado y registra cambio en HistorialEstado
  6. Sistema publica evento de cambio de estado
  7. Sistema retorna confirmación
Postcondiciones: Estado actualizado, historial registrado, evento publicado
Regla de Negocio Crítica:
  - Flujo es unidireccional: Recibido → En Viaje → Entregado
  - No se permite retroceder estados
  - Validación en frontend (opciones deshabilitadas) y backend (rechazo)
```

**Características de Implementación:**
- Endpoint: `PATCH /api/shipments/:id/estado`
- Validación de transiciones de estado
- Registro en tabla HistorialEstado con usuario responsable y timestamp
- Publicación de evento para notificaciones automáticas

---

### **CU-05: Visualizar Historial de Envío** [Operación Interna]

```
Actor: Operario, Administrador
Incluye: Iniciar Sesión
Descripción: Consulta el historial completo de cambios de estado de un envío
Precondiciones: Usuario autenticado, envío existe
Flujo Principal:
  1. Usuario selecciona un envío desde la tabla
  2. Sistema abre vista de detalle
  3. Sistema carga HistorialEstado del envío (ordenado cronológicamente)
  4. Sistema muestra:
     - Fecha y hora exacta de cada cambio
     - Estado anterior y nuevo
     - Usuario responsable del cambio
     - Observaciones (si aplican)
Postcondiciones: Historial visible al usuario
```

**Características de Implementación:**
- Endpoint: `GET /api/shipments/:id`
- Tabla inmutable HistorialEstado
- Ordenamiento por fecha descendente (más reciente primero)

---

### **CU-06: Cerrar Sesión** [Autenticación]

```
Actor: Operario, Administrador
Descripción: Invalida el token JWT activo y limpia la sesión
Precondiciones: Usuario autenticado
Flujo Principal:
  1. Usuario hace clic en "Cerrar Sesión"
  2. Sistema envía solicitud de logout: DELETE /api/auth/logout
  3. Sistema agrega JWT a lista negra en Redis (opcional)
  4. Sistema envía confirmación
  5. Cliente elimina JWT de localStorage/cookie
Postcondiciones: Sesión invalidada, cliente sin autenticación
```

**Características de Implementación:**
- Endpoint: `POST /api/auth/logout`
- Almacenamiento en Redis blacklist (opcional pero recomendado)
- Limpieza del JWT en cliente

---

### **CU-07: Generar Reporte PDF** [Operación Exclusiva Admin]

```
Actor: Administrador (exclusivo)
Incluye: Iniciar Sesión
Descripción: Genera un reporte PDF con datos de envíos filtrados
Precondiciones: Usuario autenticado con rol Administrador
Flujo Principal:
  1. Usuario selecciona opción "Generar Reporte"
  2. Sistema valida permisos (Admin únicamente)
  3. Usuario especifica filtros:
     - Rango de fechas
     - Estado (Recibido/En Viaje/Entregado)
     - Sucursal de origen/destino (opcional)
  4. Sistema consulta datos de MySQL aplicando filtros
  5. Sistema procesa información y estructura para PDF
  6. Sistema genera archivo PDF (pdfmake o PDFKit)
  7. Sistema retorna archivo para descarga/visualización
Postcondiciones: Archivo PDF disponible para descarga
Restricción: Solo Administrador tiene acceso
```

**Características de Implementación:**
- Endpoint: `GET /api/reportes?filtros`
- Generación en backend con pdfmake o PDFKit
- Validación de rol en middleware
- Streaming de archivo para descarga

---

### **CU-08: Gestionar Usuarios** [Operación Exclusiva Admin]

```
Actor: Administrador (exclusivo)
Incluye: Iniciar Sesión
Descripción: CRUD completo de usuarios internos (crear, leer, editar, desactivar)
Precondiciones: Usuario autenticado con rol Administrador
Flujo Principal (Crear Usuario):
  1. Admin accede a sección "Gestionar Usuarios"
  2. Admin selecciona "Crear Usuario"
  3. Admin completa formulario: nombre, email, rol, sucursal, contraseña temporal
  4. Sistema valida datos
  5. Sistema encripta contraseña con Bcrypt
  6. Sistema almacena usuario en BD con estado activo
  7. Sistema envía correo al usuario con credenciales temporales
Postcondiciones: Usuario creado y notificado

Flujo (Editar Usuario):
  1. Admin selecciona usuario de la lista
  2. Admin modifica datos (nombre, rol, sucursal)
  3. Sistema actualiza registro
Postcondiciones: Usuario actualizado

Flujo (Desactivar Usuario):
  1. Admin selecciona usuario
  2. Admin elige "Desactivar"
  3. Sistema marca usuario como inactivo (baja lógica)
  4. Usuario no puede iniciar sesión
Postcondiciones: Usuario inactivo, no puede autenticarse
```

**Características de Implementación:**
- Endpoints: 
  - `GET /api/users` (listado)
  - `POST /api/users` (crear)
  - `PATCH /api/users/:id` (editar)
  - `PATCH /api/users/:id/estado` (desactivar)
- Validación de rol en cada endpoint
- Encriptación Bcrypt de contraseñas
- Envío de correo con Nodemailer

---

### **CU-09: Gestionar Sucursales** [Operación Exclusiva Admin]

```
Actor: Administrador (exclusivo)
Incluye: Iniciar Sesión
Descripción: CRUD de sucursales (crear, leer, editar, desactivar)
Precondiciones: Usuario autenticado con rol Administrador
Flujo Principal:
  1. Admin accede a "Gestionar Sucursales"
  2. Admin puede: Crear, Editar, Ver lista o Desactivar sucursal
  3. Cada sucursal contiene: nombre, código único, dirección, teléfono
  4. Sistema valida código único
  5. Sistema almacena/actualiza en BD
Postcondiciones: Sucursal creada/actualizada/desactivada
```

**Características de Implementación:**
- Endpoints:
  - `GET /api/sucursales` (listado)
  - `POST /api/sucursales` (crear)
  - `PATCH /api/sucursales/:id` (editar)
- Validación de código único
- Relación con tablas Envio y Usuario

---

## 🔗 Relaciones entre Casos de Uso

### **Inclusión (`<<include>>`)**

La relación `<<include>>` indica que un caso de uso **requiere obligatoriamente** la ejecución de otro:

```
Registrar Nuevo Envío <<include>> Iniciar Sesión
Actualizar Estado Logístico <<include>> Iniciar Sesión
Generar Reporte PDF <<include>> Iniciar Sesión
Gestionar Usuarios <<include>> Iniciar Sesión
Gestionar Sucursales <<include>> Iniciar Sesión
```

**Interpretación:** Todo caso de uso interno requiere autenticación previa.

### **Restricción de Acceso**

Algunos casos de uso están **restringidos a un rol específico**:

```
CU-07 (Generar Reporte) → Solo Administrador
CU-08 (Gestionar Usuarios) → Solo Administrador
CU-09 (Gestionar Sucursales) → Solo Administrador

CU-03 (Registrar Envío) → Operario o Administrador
CU-04 (Actualizar Estado) → Operario o Administrador
```

---

## 🚀 Flujo de Interacción Típica

### **Escenario 1: Operario registra y actualiza envío**

```
1. Operario → CU-02 (Iniciar Sesión)
2. Operario → CU-03 (Registrar Nuevo Envío)
   - Sistema valida DNI vía API RENIEC
   - Genera código de tracking
   - Publica evento para notificación
3. Operario → CU-04 (Actualizar Estado: Recibido → En Viaje)
4. Operario → CU-04 (Actualizar Estado: En Viaje → Entregado)
5. Operario → CU-06 (Cerrar Sesión)
```

### **Escenario 2: Cliente consulta tracking público**

```
1. Cliente Público → CU-01 (Consultar Tracking de Envío)
   - Ingresa código sin autenticación
   - Visualiza barra de progreso dinámica
   - Ve datos origen/destino
```

### **Escenario 3: Administrador genera reporte**

```
1. Admin → CU-02 (Iniciar Sesión)
2. Admin → CU-07 (Generar Reporte PDF)
   - Especifica filtros: rango de fechas, estado
   - Descarga PDF generado
3. Admin → CU-08 (Gestionar Usuarios) - Crea nuevo usuario
4. Admin → CU-09 (Gestionar Sucursales) - Crea nueva sucursal
5. Admin → CU-06 (Cerrar Sesión)
```

---

## 📊 Resumen de Cobertura Funcional

| Caso de Uso | Actor | Autenticación | Rol Requerido | Prioridad |
|-------------|-------|---------------|---------------|-----------|
| CU-01 | Cliente Público | No | N/A | Alta |
| CU-02 | Operario, Admin | Sí | N/A | Alta |
| CU-03 | Operario, Admin | Sí | Operario+ | Alta |
| CU-04 | Operario, Admin | Sí | Operario+ | Alta |
| CU-05 | Operario, Admin | Sí | Operario+ | Media |
| CU-06 | Operario, Admin | Sí | N/A | Alta |
| CU-07 | Admin | Sí | Admin | Alta |
| CU-08 | Admin | Sí | Admin | Media |
| CU-09 | Admin | Sí | Admin | Media |

---

## 🔐 Consideraciones de Seguridad

1. **Autenticación:** JWT con expiración configurable
2. **Autorización:** Validación de rol en cada endpoint
3. **Encriptación:** Bcrypt para contraseñas
4. **Invalidación:** Redis blacklist para logout efectivo
5. **Validación externa:** HTTPS para API RENIEC
6. **Variables sensibles:** Dotenv, nunca expuestas en código

---

## 📝 Conclusión

El diagrama de casos de uso establece claramente los límites funcionales del sistema RutaSync, definiendo:
- Quién puede hacer qué (actores y acciones)
- Cuándo se requiere autenticación
- Restricciones de rol
- Dependencias entre funcionalidades

Este diagrama es el punto de partida para diseñar los endpoints de la API REST y las protecciones de seguridad en el backend.
