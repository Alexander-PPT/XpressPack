# Diagrama de Componentes - Sistema de Seguridad

**Archivo de referencia:** `Diagrama_de_componentes_-_Sistema_de_seguridad.png`

---

## Descripcion general

El sistema final usa Supabase como capa principal de datos y seguridad para el frontend desplegado. La arquitectura documentada anteriormente con API Gateway Nginx, Auth Service JWT, Redis blacklist y MySQL ya no representa la solucion actual.

La arquitectura final se resume asi:

```text
Frontend React/Vite
    |
    | HTTPS
    v
Supabase API (PostgREST + RPC + RLS)
    |
    v
PostgreSQL Supabase
```

Para la busqueda de DNI se recomienda un backend/proxy porque la API key de Decolecta no debe exponerse en el frontend.

---

## Componentes actuales

### 1. Frontend React/Vite

Responsabilidades:

- Renderizar tracking publico y panel interno.
- Gestionar rutas protegidas.
- Leer/escribir sesion local actual (`rutasync_user`, `rutasync_token`).
- Consumir Supabase directo cuando no existe backend API configurado.
- Consumir backend cuando `VITE_API_URL` apunta a un servidor real.

Rutas principales:

```text
/tracking
/login
/app
/app/envios
/app/envios/nuevo
/app/envios/:id
/app/reportes       Solo ADMIN
/app/usuarios       Solo ADMIN
/app/sucursales     Solo ADMIN
```

---

### 2. Supabase API (PostgREST + RPC)

Reemplaza al componente antiguo `API Gateway [Node.js + Express]` para el modo Supabase directo.

Responsabilidades:

- Exponer tablas mediante PostgREST.
- Ejecutar funciones RPC.
- Aplicar RLS/policies.
- Conectar el frontend con PostgreSQL.

Funciones RPC relevantes:

```text
login_usuario(p_email, p_password)
create_usuario_admin(...)
update_usuario_admin(...)
deactivate_usuario_admin(...)
```

---

### 3. Auth RPC (PostgreSQL function)

Reemplaza al componente antiguo `Servicio de Autenticacion [JWT]`.

Funcion principal:

```text
public.login_usuario(p_email, p_password)
```

Responsabilidades:

- Buscar usuario por email.
- Validar que el usuario este activo.
- Comparar password contra `passwordHash` usando `extensions.crypt`.
- Retornar usuario sin exponer `passwordHash`.

Nota:

- En el frontend actual no existe blacklist Redis.
- Si mas adelante se migra a Supabase Auth real, Supabase gestionara JWT/refresh token automaticamente.

---

### 4. Base de Datos [PostgreSQL - Supabase]

Reemplaza al componente antiguo `Base de Datos [MySQL]`.

Tablas principales:

```text
usuarios
sucursales
envios
historiales_estados
notificaciones
auditorias
```

Enums:

```text
rol_usuario = ADMIN | OPERARIO
estado_envio = Recibido | En Viaje | Entregado
estado_notificacion = PENDIENTE | ENVIADO | FALLIDO
```

Seguridad:

- RLS habilitado.
- Policies para permitir el funcionamiento del frontend actual.
- RPC con `security definer` para operaciones administradas.

---

### 5. Servicio DNI Proxy (opcional pero recomendado)

Responsabilidad:

- Recibir `GET /api/dni/:dni` desde el frontend.
- Consultar Decolecta con la API key privada.
- Retornar nombres y apellidos normalizados.

Variables:

```env
RENIEC_API_URL=https://api.decolecta.com
RENIEC_API_KEY=...
```

Motivo:

- No exponer secrets en variables `VITE_`.
- Controlar errores de la API externa.
- Mantener una salida estable para el frontend.

---

### 6. Reportes PDF

Los reportes son solo para `ADMIN`.

En modo backend:

```text
Frontend -> Backend /api/reportes/* -> PDF -> descarga
```

En modo Supabase puro, aun falta implementar generacion PDF 100% frontend o una Edge Function. Actualmente la opcion confiable es usar backend para generar el PDF porque puede proteger endpoints por rol y generar el archivo de forma controlada.

---

## Diagrama actualizado

```mermaid
flowchart TD
  UI[Frontend React/Vite]
  SUPA[Supabase API\nPostgREST + RPC + RLS]
  DB[(PostgreSQL Supabase)]
  AUTH[Auth RPC\nlogin_usuario()]
  ADMIN[Admin RPC\ncreate/update/deactivate usuario]
  DNI[Backend DNI Proxy\nDecolecta API]
  PDF[Backend Reportes PDF\nSolo ADMIN]

  UI --> SUPA
  SUPA --> DB
  SUPA --> AUTH
  SUPA --> ADMIN
  AUTH --> DB
  ADMIN --> DB
  UI --> DNI
  DNI --> DB
  UI --> PDF
  PDF --> DB
```

---

## Seguridad por rol

| Vista / accion | ADMIN | OPERARIO | Publico |
|---|---:|---:|---:|
| Tracking publico | Si | Si | Si |
| Dashboard | Si | Si | No |
| Listar envios | Si | Si | No |
| Registrar envio | Si | Si | No |
| Actualizar estado | Si | Si | No |
| Reportes PDF | Si | No | No |
| Gestionar usuarios | Si | No | No |
| Gestionar sucursales | Si | No | No |

---

## Componentes eliminados de la arquitectura final

| Componente anterior | Estado actual |
|---|---|
| API Gateway Nginx | No existe en despliegue final |
| Auth Service JWT separado | Reemplazado por RPC `login_usuario()` |
| User Service MySQL | Reemplazado por tabla `usuarios` + RPC |
| Redis blacklist | No implementado |
| MySQL | Reemplazado por PostgreSQL Supabase |
| Tablas `rol_usuarios` y `estado_envios` | Reemplazadas por ENUMs |

---

## Pendientes tecnicos recomendados

- Migrar login a Supabase Auth real si se requiere JWT/refresh token formal.
- Crear Edge Function o backend desplegado para PDF si se quiere evitar depender de Express local.
- Endurecer RLS para produccion real usando `auth.uid()` cuando se use Supabase Auth.
- Crear auditoria automatica para acciones sensibles.
