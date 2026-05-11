# Diagrama de Clases — Capa Backend (Modelos de Datos)

**Archivo de referencia:** `Diagrama_de_clases_para_Capa_Backend.png`

---

## 📊 Descripción General

El diagrama de clases del backend representa el **modelo de datos relacional** del sistema RutaSync, implementado con Sequelize ORM en Node.js. Muestra todas las entidades principales, sus atributos, relaciones de asociación, y multiplicidades. Este diagrama es el contrato de la capa de datos y define la estructura de la base de datos MySQL.

---

## 🏗️ Arquitectura de Capas (Backend)

```
┌──────────────────────────────────┐
│   CAPA PRESENTACIÓN (Express)    │
│   Controllers & Routes           │
└──────────────────┬───────────────┘
                   │
┌──────────────────▼───────────────┐
│   CAPA APLICACIÓN (Services)     │
│   Lógica de negocio, validaciones│
└──────────────────┬───────────────┘
                   │
┌──────────────────▼───────────────┐
│   CAPA DOMINIO (Entities)        │
│   Modelos y reglas de negocio    │
└──────────────────┬───────────────┘
                   │
┌──────────────────▼───────────────┐
│   CAPA DATOS (Repositories)      │
│   Sequelize ORM + MySQL          │
└──────────────────────────────────┘
```

---

## 📋 Entidades Principales

### **1. Usuario**

**Tabla:** `usuarios`

**Propósito:** Representa los usuarios internos del sistema (personal logístico).

```typescript
// Modelo Sequelize: src/data/models/usuario.model.js

interface Usuario {
  // Atributos:
  id: string;                 // UUID (PK) — Clave primaria
  nombre: string;             // Nombre completo del usuario
  email: string;              // Email único, usado para login
  passwordHash: string;       // Contraseña encriptada con Bcrypt
  rol: RolUsuario;           // FK → Tabla RolUsuario (ADMIN | OPERARIO)
  sucursalId: string;        // FK → Tabla sucursales (ubicación del usuario)
  estado: boolean;           // true = activo, false = inactivo
  creadoEn: Date;            // Timestamp creación (auto)
  actualizadoEn: Date;       // Timestamp última actualización (auto)
  
  // Métodos:
  autentica(password: string): boolean;      // Valida contraseña con Bcrypt
  cambiarPassword(nuevaPassword: string): void;  // Encripta y actualiza
  obtenerRol(): RolUsuario;  // Obtiene rol de usuario
  esActivo(): boolean;       // Valida si usuario está activo
  obtenerSucursal(): Sucursal;  // Carga sucursal asociada
  obtenerEnvios(): Envio[];  // Obtiene envíos registrados por este usuario
}

// Relaciones:
Usuario.belongsTo(RolUsuario);
Usuario.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
Usuario.hasMany(Envio, { foreignKey: 'creadoPor' });
Usuario.hasMany(HistorialEstado, { foreignKey: 'registradoPor' });
```

**Índices:**
- PK: `id` (UUID)
- Unique: `email`
- FK: `rol` → RolUsuario
- FK: `sucursalId` → Sucursales

---

### **2. RolUsuario** (Catálogo)

**Tabla:** `rol_usuarios`

**Propósito:** Catálogo de roles disponibles en el sistema.

```typescript
interface RolUsuario {
  // Atributos:
  id: int;                   // INT (PK)
  nombre: string;            // 'ADMIN' | 'OPERARIO' (único)
  descripcion: string;       // Descripción del rol
  permisos: string[];        // Array de permisos (almacenado como JSON)
  
  // Métodos:
  obtenerUsuarios(): Usuario[];  // Obtiene usuarios con este rol
}

// Relaciones:
RolUsuario.hasMany(Usuario, { foreignKey: 'rol' });
```

**Datos Iniciales (Seeder):**
```javascript
[
  {
    id: 1,
    nombre: 'ADMIN',
    descripcion: 'Administrador — Acceso total al sistema',
    permisos: ['read_users', 'create_user', 'update_user', 'delete_user', 
               'read_sucursales', 'create_sucursal', 'update_sucursal', 'delete_sucursal',
               'generate_reports', ...]
  },
  {
    id: 2,
    nombre: 'OPERARIO',
    descripcion: 'Operario — Registro y actualización de envíos',
    permisos: ['read_shipments', 'create_shipment', 'update_shipment', 
               'read_sucursales', ...]
  }
]
```

---

### **3. Sucursal**

**Tabla:** `sucursales`

**Propósito:** Define las sucursales logísticas (puntos de origen y destino).

```typescript
interface Sucursal {
  // Atributos:
  id: string;                 // UUID (PK)
  nombre: string;             // Ej: "Sucursal Arequipa"
  codigo: string;             // Código único, Ej: "AQP-001"
  direccion: string;          // Dirección completa
  telefono: string;           // Teléfono de contacto
  estado: boolean;            // true = activa, false = inactiva
  creadoEn: Date;             // Timestamp creación (auto)
  actualizadoEn: Date;        // Timestamp actualización (auto)
  
  // Métodos:
  obtenerUsuarios(): Usuario[];         // Obtiene usuarios asignados
  obtenerEnviosOrigen(): Envio[];       // Envíos donde es origen
  obtenerEnviosDestino(): Envio[];      // Envíos donde es destino
  esActiva(): boolean;
  desactivar(): void;
}

// Relaciones:
Sucursal.hasMany(Usuario, { foreignKey: 'sucursalId' });
Sucursal.hasMany(Envio, { 
  foreignKey: 'sucursalOrigenId',
  as: 'enviosOrigen'
});
Sucursal.hasMany(Envio, {
  foreignKey: 'sucursalDestinoId',
  as: 'enviosDestino'
});
```

**Índices:**
- PK: `id` (UUID)
- Unique: `codigo`

---

### **4. Envío**

**Tabla:** `envios`

**Propósito:** Entidad central del dominio. Representa un paquete en el sistema.

```typescript
interface Envio {
  // Atributos:
  id: string;                     // UUID (PK)
  guia: string;                   // Número de guía (único)
  codigoTracking: string;         // Código de tracking (único, visible públicamente)
  origen: string;                 // Descripción de origen
  destino: string;                // Descripción de destino
  remitenteNombre: string;        // Nombre del remitente
  remitenteDni: string;           // DNI del remitente (validado)
  remitenteTelefono: string;      // Teléfono del remitente
  destinatarioNombre: string;     // Nombre del destinatario
  destinatarioDni: string;        // DNI del destinatario (validado con RENIEC)
  destinatarioTelefono: string;   // Teléfono del destinatario
  peso: Decimal;                  // Peso en kg (ej: 2.5)
  dimensiones: string;            // Dimensiones (ej: "30x20x10 cm")
  tipoServicio: string;           // Tipo de servicio (estándar, express, etc.)
  descripcion: string;            // Descripción del contenido
  estadoActualId: string;         // FK → EstadoEnvio (estado actual)
  sucursalOrigenId: string;       // FK → Sucursales (sucursal de origen)
  sucursalDestinoId: string;      // FK → Sucursales (sucursal de destino)
  creadoPor: string;              // FK → Usuarios (usuario que registró)
  creadoEn: Date;                 // Timestamp creación (auto)
  actualizadoEn: Date;            // Timestamp actualización (auto)
  
  // Métodos:
  generarGuia(): string;                      // Genera número único de guía
  generarCodigoTracking(): string;           // Genera código tracking
  obtenerEstadoActual(): EstadoEnvio;        // Obtiene estado actual
  cambiarEstado(nuevoEstado: EstadoEnvio): void;  // Transiciona estado
  obtenerHistorial(): HistorialEstado[];    // Obtiene historial de cambios
  obtenerNotificaciones(): Notificacion[];   // Obtiene notificaciones asociadas
  esEntregado(): boolean;                    // Valida si está en estado final
  puedeTransicionarA(estado: EstadoEnvio): boolean;  // Valida transición
}

// Relaciones:
Envio.belongsTo(EstadoEnvio, { foreignKey: 'estadoActualId' });
Envio.belongsTo(Sucursal, { 
  foreignKey: 'sucursalOrigenId',
  as: 'sucursalOrigen'
});
Envio.belongsTo(Sucursal, {
  foreignKey: 'sucursalDestinoId',
  as: 'sucursalDestino'
});
Envio.belongsTo(Usuario, { foreignKey: 'creadoPor' });
Envio.hasMany(HistorialEstado, { 
  foreignKey: 'envioId',
  as: 'historial'
});
Envio.hasMany(Notificacion, { foreignKey: 'envioId' });
```

**Índices:**
- PK: `id` (UUID)
- Unique: `guia`, `codigoTracking`
- FK: `estadoActualId` → EstadoEnvio
- FK: `sucursalOrigenId` → Sucursales
- FK: `sucursalDestinoId` → Sucursales
- FK: `creadoPor` → Usuarios
- Index: `creadoEn` (búsqueda por fecha)

---

### **5. EstadoEnvío** (Catálogo)

**Tabla:** `estado_envios`

**Propósito:** Catálogo inmutable de estados posibles para un envío.

```typescript
interface EstadoEnvio {
  // Atributos:
  id: string;                 // UUID (PK)
  nombre: string;             // 'Recibido' | 'En Viaje' | 'Entregado'
  codigo: int;                // 1, 2, 3 (para ordenamiento)
  descripcion: string;        // Descripción del estado
  esEstadoFinal: boolean;     // true si es estado terminal (no permite transiciones)
  progreso: int;              // Porcentaje: 33, 66, 100
  color: string;              // Hex: #2E75B6, #E67E22, #27AE60
  
  // Métodos:
  esTransitable(): boolean;   // Valida si puede salir de este estado
  obtenerEnvios(): Envio[];   // Obtiene envíos en este estado
}

// Relaciones:
EstadoEnvio.hasMany(Envio, { foreignKey: 'estadoActualId' });
EstadoEnvio.hasMany(HistorialEstado, { foreignKey: 'estadoId' });
```

**Datos Iniciales (Seeder):**
```javascript
[
  {
    id: 'estado-1',
    nombre: 'Recibido',
    codigo: 1,
    descripcion: 'Paquete recibido en sucursal de origen',
    esEstadoFinal: false,
    progreso: 33,
    color: '#2E75B6'  // Azul
  },
  {
    id: 'estado-2',
    nombre: 'En Viaje',
    codigo: 2,
    descripcion: 'Paquete en tránsito hacia sucursal de destino',
    esEstadoFinal: false,
    progreso: 66,
    color: '#E67E22'  // Ámbar
  },
  {
    id: 'estado-3',
    nombre: 'Entregado',
    codigo: 3,
    descripcion: 'Paquete entregado al destinatario',
    esEstadoFinal: true,
    progreso: 100,
    color: '#27AE60'  // Verde
  }
]
```

---

### **6. HistorialEstado**

**Tabla:** `historial_estados`

**Propósito:** Registro inmutable de cada cambio de estado. Genera la trazabilidad completa.

```typescript
interface HistorialEstado {
  // Atributos:
  id: string;                 // UUID (PK)
  envioId: string;            // FK → Envios (envío asociado)
  estadoId: string;           // FK → EstadoEnvios (estado nuevo)
  observacion?: string;       // Observación opcional (máx 500 caracteres)
  fechaHora: Date;            // Timestamp del cambio (auto: NOW())
  registradoPor: string;      // FK → Usuarios (usuario que ejecutó cambio)
  
  // Métodos:
  obtenerEnvio(): Envio;      // Carga envío asociado
  obtenerEstado(): EstadoEnvio;   // Carga estado asociado
  obtenerUsuario(): Usuario;  // Carga usuario responsable
}

// Relaciones:
HistorialEstado.belongsTo(Envio, { foreignKey: 'envioId' });
HistorialEstado.belongsTo(EstadoEnvio, { foreignKey: 'estadoId' });
HistorialEstado.belongsTo(Usuario, { foreignKey: 'registradoPor' });
```

**Características:**
- **Inmutable:** Una vez insertado, no puede actualizarse ni borrarse
- **Índices:**
  - PK: `id` (UUID)
  - FK: `envioId` → Envios
  - FK: `estadoId` → EstadoEnvios
  - FK: `registradoPor` → Usuarios
  - Index: `fechaHora` (ordenamiento)
  - Composite Index: (`envioId`, `fechaHora`)

**Ejemplo de Historial para un Envío:**
```
Envio ID: "envio-123"
  ├─ Estado 1: Recibido     (2026-05-10 08:30) registrado por Admin
  ├─ Estado 2: En Viaje     (2026-05-10 14:15) registrado por Operario
  └─ Estado 3: Entregado    (2026-05-11 16:45) registrado por Operario
```

---

### **7. Notificación**

**Tabla:** `notificaciones`

**Propósito:** Registro de notificaciones enviadas automáticamente.

```typescript
interface Notificacion {
  // Atributos:
  id: string;                 // UUID (PK)
  envioId: string;            // FK → Envios (envío asociado)
  tipo: TipoNotificacion;     // CREACION_ENVIO | ACTUALIZACION_ESTADO | ...
  destinatario: string;       // Email del destinatario
  asunto: string;             // Asunto del correo
  mensaje: string;            // Cuerpo del correo (HTML)
  estado: EstadoNotificacion; // PENDIENTE | ENVIADO | FALLIDO
  enviadoEn: Date;            // Timestamp envío (NULL si aún pendiente)
  intentosFallidos: int;      // Contador de reintentos fallidos
  ultimoIntento: Date;        // Fecha último intento (para retry)
  
  // Métodos:
  marcarEnviada(): void;      // Actualiza estado a ENVIADO
  marcarFallida(): void;      // Actualiza estado a FALLIDO
  puedeProcesarse(): boolean; // Valida si puede reenviarse
}

enum TipoNotificacion {
  CREACION_ENVIO = 'CREACION_ENVIO',        // Al registrar envío
  ACTUALIZACION_ESTADO = 'ACTUALIZACION_ESTADO',  // Al cambiar estado
  ENTREGA_EXITOSA = 'ENTREGA_EXITOSA',     // Al llegar a destino
  ALERTA = 'ALERTA',                        // Por incidencias
  OTRO = 'OTRO'
}

enum EstadoNotificacion {
  PENDIENTE = 'PENDIENTE',    // Aún no se envía
  ENVIADO = 'ENVIADO',        // Enviado exitosamente
  FALLIDO = 'FALLIDO'         // Error en envío
}

// Relaciones:
Notificacion.belongsTo(Envio, { foreignKey: 'envioId' });
```

**Índices:**
- PK: `id` (UUID)
- FK: `envioId` → Envios
- Index: `estado` (filtrado de notificaciones pendientes)
- Composite Index: (`estado`, `ultimoIntento`) (para retry)

---

## 📊 Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                         USUARIO (N)                              │
│                                                                   │
│  ├──→ (1) RolUsuario                                             │
│  ├──→ (1) Sucursal                                               │
│  ├──→ (N) Envio [creadoPor]                                      │
│  └──→ (N) HistorialEstado [registradoPor]                        │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│                        SUCURSAL (N)                              │
│                                                                   │
│  ├──→ (1) Usuario [sucursalId]                                   │
│  ├──→ (N) Envio [sucursalOrigenId]                               │
│  └──→ (N) Envio [sucursalDestinoId]                              │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│                        ENVÍO (N)                                 │
│                                                                   │
│  ├──→ (1) EstadoEnvio [estadoActualId]                           │
│  ├──→ (1) Sucursal [sucursalOrigenId] — como origen             │
│  ├──→ (1) Sucursal [sucursalDestinoId] — como destino           │
│  ├──→ (1) Usuario [creadoPor]                                    │
│  ├──→ (N) HistorialEstado [envioId]                              │
│  └──→ (N) Notificacion [envioId]                                 │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│                   HISTÓRIAL ESTADO (N)                           │
│                                                                   │
│  ├──→ (1) Envio                                                  │
│  ├──→ (1) EstadoEnvio                                            │
│  └──→ (1) Usuario [registradoPor]                                │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│                     NOTIFICACIÓN (N)                             │
│                                                                   │
│  └──→ (1) Envio                                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Transiciones de Estado (Regla de Negocio)

```javascript
// Matriz de transiciones válidas
const transicionesValidas = {
  1: [2],        // Recibido → En Viaje
  2: [3],        // En Viaje → Entregado
  3: []          // Entregado → (terminal, sin transiciones)
};

// Implementación en backend
class EnvioService {
  puedeTransicionar(estadoActual, estadoNuevo) {
    return transicionesValidas[estadoActual.codigo]?.includes(estadoNuevo.codigo) ?? false;
  }
  
  cambiarEstado(envioId, nuevoEstado, usuario) {
    const envio = Envio.findByPk(envioId);
    const estadoActual = envio.estadoActual;
    
    if (!this.puedeTransicionar(estadoActual, nuevoEstado)) {
      throw new Error(`Transición inválida: ${estadoActual.nombre} → ${nuevoEstado.nombre}`);
    }
    
    // Registra cambio en HistorialEstado
    HistorialEstado.create({
      envioId,
      estadoId: nuevoEstado.id,
      registradoPor: usuario.id,
      fechaHora: new Date()
    });
    
    // Actualiza estado actual
    envio.estadoActualId = nuevoEstado.id;
    envio.save();
    
    // Publica evento para notificaciones
    EventEmitter.emit('shipment_status_changed', { envioId, nuevoEstado });
  }
}
```

---

## 🗄️ Migraciones Sequelize

```javascript
// migrations/YYYYMMDDHHMMSS-create-usuarios.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usuarios', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      passwordHash: { type: Sequelize.STRING(255), allowNull: false },
      rol: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'rol_usuarios', key: 'id' } },
      sucursalId: { type: Sequelize.UUID, references: { model: 'sucursales', key: 'id' } },
      estado: { type: Sequelize.BOOLEAN, defaultValue: true },
      creadoEn: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      actualizadoEn: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('usuarios');
  }
};
```

---

## 📊 Resumen de Multiplicidades

| Relación | Multiplicidad | Descripción |
|----------|---------------|-------------|
| Usuario → RolUsuario | N:1 | Varios usuarios → Un rol |
| Usuario → Sucursal | N:1 | Varios usuarios → Una sucursal |
| Usuario → Envio | 1:N | Un usuario registra varios envíos |
| Usuario → HistorialEstado | 1:N | Un usuario registra varios cambios |
| Sucursal → Envio (origen) | 1:N | Una sucursal es origen de varios envíos |
| Sucursal → Envio (destino) | 1:N | Una sucursal es destino de varios envíos |
| Envio → EstadoEnvio | N:1 | Varios envíos pueden estar en un estado |
| Envio → HistorialEstado | 1:N | Un envío tiene varios cambios de estado |
| Envio → Notificacion | 1:N | Un envío genera varias notificaciones |
| EstadoEnvio → HistorialEstado | 1:N | Un estado aparece en varios históriales |

---

## 🔐 Consideraciones de Integridad

1. **Claves Foráneas (FK):** Todas las FK tienen restricción ON DELETE/UPDATE
2. **Único (Unique):** Email de usuario, código de tracking, guía
3. **Not Null:** Campos obligatorios validados en DB
4. **Defaults:** Timestamps (creadoEn, actualizadoEn), estado (true)
5. **Índices:** Optimizados para búsquedas frecuentes (email, tracking, fecha)

---

## 📝 Conclusión

El diagrama de clases del backend define la estructura relacional completa de RutaSync:
- **7 entidades principales** organizadas por responsabilidad
- **Relaciones claras** entre entidades con multiplicidades
- **Validaciones de negocio** en el nivel de modelo
- **Trazabilidad completa** mediante tabla HistorialEstado inmutable
- **Escalabilidad** mediante índices y migraciones versionadas

Esta estructura garantiza integridad referencial, trazabilidad auditada y cumplimiento de reglas de negocio.
