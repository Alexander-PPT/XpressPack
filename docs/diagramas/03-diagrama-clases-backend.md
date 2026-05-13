# Diagrama de Clases - Capa Backend (BD final Supabase)

**Archivo de referencia:** `Diagrama_de_clases_para_Capa_Backend.png`

---

## Descripcion general

Este documento describe el modelo de datos final de XpressPack/RutaSync usando **PostgreSQL en Supabase**. La version actual ya no modela roles ni estados como tablas catalogo separadas; ambos son `ENUM` de PostgreSQL.

La capa de datos real queda representada por:

- `usuarios`
- `sucursales`
- `envios`
- `historiales_estados`
- `notificaciones`
- `auditorias`
- funciones RPC: `login_usuario`, `create_usuario_admin`, `update_usuario_admin`, `deactivate_usuario_admin`

---

## Arquitectura de persistencia

```text
Frontend React/Vite
    |
    | Supabase client / PostgREST / RPC
    v
Supabase API
    |
    v
PostgreSQL + RLS + Functions RPC
```

---

## Enumerados

### RolUsuario

`RolUsuario` no es tabla ni entidad. Es un ENUM:

```sql
rol_usuario = 'ADMIN' | 'OPERARIO'
```

Uso:

```ts
type RolUsuario = 'ADMIN' | 'OPERARIO';
```

### EstadoEnvio

`EstadoEnvio` no es tabla ni entidad. Es un ENUM:

```sql
estado_envio = 'Recibido' | 'En Viaje' | 'Entregado'
```

Transiciones permitidas:

```text
Recibido -> En Viaje -> Entregado
```

No se permite retroceder desde `Entregado`.

---

## Entidades principales

### Usuario

**Tabla:** `usuarios`

```ts
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: RolUsuario;
  sucursalId?: string | null;
  estado: boolean;
  telefonoContacto?: string | null;
  ultimoAcceso?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

Relaciones:

- `usuarios.sucursalId` -> `sucursales.id`
- `usuarios.id` puede aparecer como `envios.operarioAsignadoId`
- `usuarios.id` puede aparecer como `historiales_estados.operarioId`

Notas:

- `passwordHash` se genera con `extensions.crypt(..., extensions.gen_salt('bf'))`.
- La autenticacion del frontend actual usa RPC `login_usuario(email, password)`.
- La creacion/actualizacion de usuarios desde frontend se controla con RPC de admin.

---

### Sucursal

**Tabla:** `sucursales`

```ts
interface Sucursal {
  id: string;
  nombre: string;
  codigo: string;
  ciudad: string;
  departamento: string;
  direccion: string;
  telefono?: string | null;
  email?: string | null;
  encargado?: string | null;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

Relaciones:

- Una sucursal puede ser origen de muchos envios: `envios.sucursalOrigenId`.
- Una sucursal puede ser destino de muchos envios: `envios.sucursalDestinoId`.
- Una sucursal puede tener muchos usuarios asociados mediante `usuarios.sucursalId`.

---

### Envio

**Tabla:** `envios`

```ts
interface Envio {
  id: string;
  guia: string;
  codigoTracking: string;
  remitenteDni: string;
  remitenteNombre: string;
  remitenteEmail: string;
  remitentePhone?: string | null;
  destinatarioDni: string;
  destinatarioNombre: string;
  destinatarioEmail: string;
  destinatarioPhone?: string | null;
  peso: number;
  volumen?: number | null;
  dimensiones?: string | null;
  tipoServicio: string;
  descripcion?: string | null;
  estado: EstadoEnvio;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  operarioAsignadoId?: string | null;
  monto?: number | null;
  valorDeclarado?: number | null;
  fechaEntrega?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

Correccion importante del modelo:

- No existen `origen: string` ni `destino: string` como campos principales.
- El origen y destino se modelan con FKs:
  - `sucursalOrigenId` -> `sucursales.id`
  - `sucursalDestinoId` -> `sucursales.id`

Estado inicial:

```text
Recibido
```

No existe el estado `REGISTRADO` en la BD final.

---

### HistorialEstado

**Tabla:** `historiales_estados`

```ts
interface HistorialEstado {
  id: string;
  envioId: string;
  estadoAnterior?: EstadoEnvio | null;
  estadoNuevo: EstadoEnvio;
  razon?: string | null;
  operarioId?: string | null;
  ubicacion?: string | null;
  fotografia?: string | null;
  createdAt: Date;
}
```

Correccion importante:

- No existe `estadoId`.
- No existe `observacion` como campo principal.
- Los estados se guardan directamente como ENUM en:
  - `estadoAnterior`
  - `estadoNuevo`

Uso:

- Se crea un historial inicial al insertar un envio.
- Se crea un historial nuevo cuando cambia `envios.estado`.

---

### Notificacion

**Tabla:** `notificaciones`

```ts
interface Notificacion {
  id: string;
  tipo: string;
  destinatarioEmail: string;
  asunto: string;
  contenido: string;
  envioId?: string | null;
  usuarioId?: string | null;
  estado: 'PENDIENTE' | 'ENVIADO' | 'FALLIDO';
  mensajeError?: string | null;
  intentos: number;
  proximoIntento?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

Correccion importante:

- El campo correcto es `destinatarioEmail`, no `destinatario`.
- El mensaje se separa en `asunto` y `contenido`.
- Se agregan campos de reintento:
  - `intentos`
  - `proximoIntento`
  - `mensajeError`

---

### Auditoria

**Tabla:** `auditorias`

```ts
interface Auditoria {
  id: string;
  tipoAccion: string;
  entidadTipo: string;
  entidadId: string;
  usuarioId?: string | null;
  detalles?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}
```

---

## Relaciones principales

```text
Sucursal 1 ---- N Usuario
Sucursal 1 ---- N Envio (como origen)
Sucursal 1 ---- N Envio (como destino)
Usuario  1 ---- N Envio (operarioAsignadoId)
Usuario  1 ---- N HistorialEstado (operarioId)
Envio    1 ---- N HistorialEstado
Envio    1 ---- N Notificacion
Usuario  1 ---- N Notificacion
Usuario  1 ---- N Auditoria
```

---

## Funciones RPC relevantes

### `login_usuario(p_email, p_password)`

Valida email, estado activo y password con `extensions.crypt`.

Retorna:

```ts
{
  id: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'OPERARIO';
  sucursalId: string | null;
  estado: boolean;
}
```

### `create_usuario_admin(...)`

Crea usuarios desde el panel solo si `p_actor_email` pertenece a un usuario `ADMIN` activo.

### `update_usuario_admin(...)`

Actualiza datos permitidos de un usuario solo si el actor es `ADMIN`.

### `deactivate_usuario_admin(...)`

Desactiva usuarios solo si el actor es `ADMIN`.

---

## Resumen de correcciones frente al diseno anterior

| Antes | Ahora |
|---|---|
| MySQL + Sequelize como BD final | PostgreSQL + Supabase |
| `RolUsuario` como tabla | `rol_usuario` como ENUM |
| `EstadoEnvio` como tabla | `estado_envio` como ENUM |
| `origen` y `destino` string | `sucursalOrigenId` y `sucursalDestinoId` |
| `estadoActualId` | `estado` ENUM |
| `HistorialEstado.estadoId` | `estadoAnterior` y `estadoNuevo` |
| `Notificacion.destinatario` | `destinatarioEmail` |
| Sin reintentos en notificaciones | `intentos`, `proximoIntento`, `mensajeError` |
