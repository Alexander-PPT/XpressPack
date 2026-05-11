# RutaSync — Documento de Análisis de Requerimientos
**Sistema Ágil de Tracking y Gestión de Envíos**

> **Versión:** 2.0 | **Proyecto Final Full Stack**
> **Autor:** Ebert Alonso Valdez Reyes
> **Carrera:** Ingeniería de Software con Inteligencia Artificial
> **Institución:** SENATI — Dirección Zonal Arequipa - Puno | 2026

---

## Índice

1. [Introducción](#1-introducción)
2. [Actores del Sistema](#2-actores-del-sistema)
3. [Requerimientos Funcionales](#3-requerimientos-funcionales)
4. [Requerimientos No Funcionales](#4-requerimientos-no-funcionales-arquitectura-y-stack-tecnológico)
5. [Casos de Uso Principales](#5-casos-de-uso-principales)
6. [Flujo de Estados Logísticos](#6-flujo-de-estados-logísticos)
7. [Restricciones y Supuestos](#7-restricciones-y-supuestos-del-sistema)
8. [Criterios de Aceptación Mínimos](#8-criterios-de-aceptación-mínimos)
9. [Modelo de Entidades](#9-modelo-de-entidades-del-sistema)
10. [Diagramas UML](#10-diagramas-uml-del-sistema)
11. [Arquitectura del Sistema](#11-arquitectura-del-sistema)

---

## 1. Introducción

### 1.1 Propósito del Documento

El presente documento detalla el análisis de requerimientos funcionales y no funcionales del sistema RutaSync. Su objetivo es establecer un contrato técnico claro entre el equipo de desarrollo y los interesados, definiendo con precisión el alcance, las funcionalidades esperadas, las restricciones del sistema y los criterios de aceptación mínimos para el proyecto final.

### 1.2 Propósito del Sistema

RutaSync es una aplicación web Full Stack orientada a la trazabilidad logística de envíos. El sistema está diseñado con dos objetivos centrales:

- **Simplificar la carga administrativa** del personal interno mediante un panel de gestión directo y eficiente.
- **Ofrecer al cliente final** una experiencia de consulta de alto impacto visual a través de una representación asíncrona y dinámica del estado de su paquete, sin necesidad de autenticación.

### 1.3 Alcance

- Panel de administración privado con autenticación JWT y gestión completa de envíos, usuarios y sucursales.
- Landing page pública de tracking con representación visual dinámica del estado del paquete.
- API REST como capa de comunicación entre el frontend (React + TypeScript) y la base de datos relacional (MySQL).
- Integración con la API RENIEC (servicio externo) para validación de DNI de remitentes y destinatarios vía HTTPS.
- Servicio de notificaciones por correo electrónico (Nodemailer) para confirmación de registro y cambios de estado.
- Despliegue contenerizado mediante Docker y Docker Compose para garantizar portabilidad del sistema.

### 1.4 Definiciones y Abreviaturas

| Término | Definición |
|---------|-----------|
| **RF** | Requerimiento Funcional. Describe una funcionalidad concreta que el sistema debe ejecutar. |
| **RNF** | Requerimiento No Funcional. Describe restricciones de calidad, tecnología o arquitectura. |
| **JWT** | JSON Web Token. Mecanismo de autenticación basado en tokens firmados digitalmente. |
| **ORM** | Object-Relational Mapping. Capa de abstracción para interactuar con la base de datos mediante objetos. |
| **SPA** | Single Page Application. Aplicación web que opera sin recargas completas de página. |
| **API REST** | Interfaz de programación basada en HTTP y principios REST para el intercambio de datos en JSON. |
| **RENIEC** | Registro Nacional de Identificación y Estado Civil. Provee la API de validación de DNI. |
| **Redis** | Base de datos en memoria utilizada para la invalidación (blacklist) de tokens JWT al cerrar sesión. |

---

## 2. Actores del Sistema

El sistema opera con tres actores bajo un esquema de control de roles. El acceso al panel administrativo se controla mediante roles asignados a cada usuario autenticado:

| Actor | Tipo | Descripción |
|-------|------|-------------|
| **Administrador** | Autenticado (interno) | Personal logístico con acceso completo al panel de gestión. Registra envíos, actualiza estados, gestiona usuarios y sucursales, y supervisa el sistema. Puede generar reportes en PDF. |
| **Operario** | Autenticado (interno, rol restringido) | Personal logístico con acceso limitado. Puede registrar y actualizar envíos, pero no gestiona usuarios ni accede a reportes administrativos. |
| **Cliente Público** | No autenticado (público) | Usuario final que consulta el estado de su paquete mediante un código de tracking único desde la landing page pública. No requiere autenticación. |

---

## 3. Requerimientos Funcionales

### 3.1 Módulo de Administración (Panel Privado)

Este módulo está destinado exclusivamente al personal interno autenticado. Gestiona el ciclo de vida completo de los envíos desde su registro hasta la entrega final. El acceso y las acciones disponibles varían según el rol del usuario (Administrador u Operario).

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| **RF-01** | Autenticación segura | El sistema permitirá el acceso al panel administrativo únicamente mediante credenciales válidas (email y contraseña). Las contraseñas se almacenarán encriptadas con Bcrypt. El sistema generará un JWT con tiempo de expiración configurable. El token puede ser invalidado almacenándolo en Redis (lista negra) al cerrar sesión. | Alta |
| **RF-02** | Cierre de sesión | El usuario autenticado podrá cerrar sesión en cualquier momento. El sistema invalidará el token JWT activo (vía Redis blacklist), impidiendo su reutilización y forzando nueva autenticación. | Alta |
| **RF-03** | Registro de envío | El Operario o Administrador registrará un paquete mediante formulario con los campos: DNI del remitente, nombre del remitente, DNI del destinatario, nombre del destinatario, sucursal de origen, sucursal de destino, peso, dimensiones, tipo de servicio y descripción. La validación de DNI se realizará en tiempo real mediante integración con la API RENIEC vía HTTPS. | Alta |
| **RF-04** | Generación de código de tracking | Tras guardar el registro, el backend generará automáticamente un código de tracking único (guía) con formato alfanumérico, garantizando que no existan duplicados en la base de datos. El código será visible de inmediato. | Alta |
| **RF-05** | Gestión de estados logísticos | El Operario o Administrador podrá actualizar el estado de cada envío. El flujo es estrictamente secuencial: Recibido → En Viaje → Entregado. No se permitirá retroceder un estado. La restricción se valida tanto en frontend como en backend. | Alta |
| **RF-06** | Historial de envío | El usuario autenticado podrá consultar el detalle completo de un envío, incluyendo fecha y hora exacta de cada cambio de estado, observaciones y usuario responsable de cada transición. | Media |
| **RF-07** | Gestión de Roles y Usuarios | El sistema implementará dos perfiles: Administrador (acceso total, incluye CRUD de usuarios y sucursales) y Operario (solo registrar y actualizar envíos). El backend validará el rol en cada petición mediante el JWT. Las rutas protegidas verificarán autenticación y nivel de permiso. | Alta |
| **RF-08** | CRUD Completo | El panel implementará operaciones CRUD sobre las entidades principales. Para **Envíos**: Crear, Leer (listado paginado y detalle), Actualizar y Eliminar (baja lógica). Para **Usuarios** (solo Administrador): Crear, Leer, Actualizar y Desactivar. Para **Sucursales** (solo Administrador): Crear, Leer, Actualizar y Desactivar. Cada operación mapeada a su endpoint REST correspondiente (GET, POST, PUT/PATCH, DELETE). | Alta |
| **RF-09** | Generación de Reportes en PDF | El Administrador podrá generar reportes PDF directamente desde el panel, previo chequeo de permisos. Los reportes incluirán: (1) Envíos por rango de fechas con estado y datos de remitente/destinatario. (2) Envíos por estado (Recibido, En Viaje, Entregado). La generación se realizará en el backend con PDFKit o pdfmake; el archivo se entrega al cliente para descarga inmediata. | Alta |
| **RF-10** | Notificaciones por correo | El sistema enviará notificaciones automáticas por correo electrónico al destinatario cuando se registre un nuevo envío y cuando se actualice el estado logístico. Las notificaciones se gestionan mediante el Servicio de Notificaciones (Node.js + Nodemailer). El evento de envío se publica de forma asíncrona tras la creación del registro. | Media |

### 3.2 Módulo de Tracking Público

Este módulo es la interfaz visible para el cliente final. No requiere autenticación y está diseñado para ofrecer una experiencia de consulta rápida, clara y visualmente impactante.

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| **RF-11** | Búsqueda pública por código | La landing page pública contará con un campo de búsqueda donde el Cliente ingresará su código de tracking. La búsqueda se ejecutará de forma asíncrona sin recargar la página, consumiendo el endpoint público de la API REST. | Alta |
| **RF-12** | Representación visual del estado | Al ingresar un código válido, el sistema renderizará una tarjeta de resultado con barra de progreso dinámica: Recibido = 33% (azul #2E75B6), En Viaje = 66% (ámbar #E67E22), Entregado = 100% (verde #27AE60). La tarjeta incluirá origen, destino, descripción y fecha del último estado. | Alta |
| **RF-13** | Manejo de código inválido | Si el Cliente ingresa un código que no existe, el sistema mostrará un mensaje de error claro y amigable indicando que el código no fue encontrado, sin exponer información técnica. | Alta |

---

## 4. Requerimientos No Funcionales (Arquitectura y Stack Tecnológico)

Los siguientes requerimientos definen las decisiones técnicas, de seguridad y de despliegue que condicionan el diseño e implementación de todo el sistema:

| ID | Categoría | Descripción |
|----|-----------|-------------|
| **RNF-01** | Frontend | Interfaz desarrollada como SPA con React.js y TypeScript, con Vite como bundler para HMR y tiempos de compilación optimizados. Estilos con Tailwind CSS. Las peticiones al backend se realizarán de forma asíncrona mediante Axios. |
| **RNF-02** | Backend | API REST construida con Node.js y Express.js, siguiendo una arquitectura por capas (Presentación, Aplicación, Dominio, Datos). Todas las respuestas en formato JSON con códigos de estado HTTP estándar. El API Gateway utiliza Nginx como proxy inverso. |
| **RNF-03** | Base de Datos | Base de datos relacional MySQL gestionada mediante ORM (Sequelize) para abstracción de consultas SQL y manejo de migraciones versionadas. Se utilizará Redis para la invalidación de tokens JWT (blacklist). |
| **RNF-04** | Seguridad | Las rutas del panel administrativo estarán protegidas mediante middlewares que validan JWT en cada petición. Contraseñas encriptadas con Bcrypt. Variables de entorno sensibles gestionadas con dotenv y nunca expuestas en el repositorio. Comunicación con APIs externas exclusivamente vía HTTPS. |
| **RNF-05** | Despliegue | El sistema será contenerizado mediante Docker, con contenedores independientes para backend, frontend y base de datos, orquestados con Docker Compose para garantizar portabilidad y consistencia entre entornos. |
| **RNF-06** | Rendimiento | El panel administrativo debe responder en menos de 2 segundos para operaciones de lectura estándar. La búsqueda pública de tracking debe responder en menos de 1 segundo bajo carga normal. |

---

## 5. Casos de Uso Principales

Los siguientes casos de uso representan las interacciones más relevantes entre los actores y el sistema:

| ID | Actor | Caso de Uso |
|----|-------|-------------|
| **CU-01** | Administrador / Operario | Iniciar sesión en el panel administrativo con credenciales válidas (autenticación JWT). |
| **CU-02** | Administrador / Operario | Registrar un nuevo envío con validación automática de DNI vía API RENIEC. |
| **CU-03** | Administrador / Operario | Consultar la tabla de envíos y actualizar el estado logístico de un paquete. |
| **CU-04** | Administrador / Operario | Visualizar el historial completo de estados de un envío específico. |
| **CU-05** | Administrador / Operario | Cerrar sesión invalidando el token JWT activo. |
| **CU-06** | Administrador | Generar reporte PDF de envíos filtrado por rango de fechas o estado logístico. |
| **CU-07** | Administrador | Gestionar usuarios internos: crear, editar, asignar roles y desactivar cuentas. |
| **CU-08** | Administrador | Gestionar sucursales: crear, editar y desactivar sucursales del sistema. |
| **CU-09** | Cliente Público | Ingresar un código de tracking en la landing page y visualizar el estado del paquete con representación visual dinámica. |

---

## 6. Flujo de Estados Logísticos

El ciclo de vida de un envío sigue un flujo de estados estrictamente secuencial y unidireccional. Cada transición solo puede ser ejecutada por el personal autenticado desde el panel de gestión.

```
Recibido (33%) ──→ En Viaje (66%) ──→ Entregado (100%)
```

| Estado | Código | Progreso Visual | Color Indicador |
|--------|--------|-----------------|-----------------|
| **Recibido** | 1 | 33% | Azul (`#2E75B6`) |
| **En Viaje** | 2 | 66% | Ámbar (`#E67E22`) |
| **Entregado** | 3 | 100% | Verde (`#27AE60`) |

> **⚠️ Regla de negocio crítica:** Una vez que un envío avanza de estado, **no es posible revertirlo** al estado anterior. El sistema validará esta restricción tanto en el frontend (deshabilitando la opción en el selector) como en el backend (rechazando la petición si el estado solicitado es inferior al actual).

---

## 7. Restricciones y Supuestos del Sistema

| Tipo | Descripción |
|------|-------------|
| **Restricción** | El flujo de estados es unidireccional. No se permite retroceder un paquete de 'En Viaje' a 'Recibido'. El sistema valida esta regla en frontend y backend. |
| **Restricción** | El módulo de tracking público no requiere autenticación. El único identificador válido es el código de tracking alfanumérico generado por el sistema. |
| **Restricción** | La gestión de usuarios y sucursales está reservada exclusivamente al rol Administrador. Los Operarios no tienen acceso a estas funcionalidades. |
| **Restricción** | Las credenciales de acceso de los usuarios internos serán gestionadas directamente por el Administrador. No existe módulo de auto-registro. |
| **Supuesto** | La API RENIEC estará disponible durante el proceso de registro de envíos. En caso de fallo del servicio externo, el sistema permitirá el registro manual del nombre del destinatario. |
| **Supuesto** | El sistema operará en un entorno con acceso a internet para la consulta del servicio externo de validación de DNI. |
| **Supuesto** | El servicio de correo (Nodemailer/SMTP) estará configurado y disponible para el envío de notificaciones automáticas. |

---

## 8. Criterios de Aceptación Mínimos

El sistema se considerará funcional y aceptable cuando cumpla al menos los siguientes criterios verificables:

### Panel Administrativo

- [ ] El Administrador y el Operario pueden iniciar y cerrar sesión correctamente, con token JWT válido entre peticiones.
- [ ] El sistema rechaza el acceso al panel si el token está ausente, expirado o es inválido.
- [ ] El formulario de registro valida todos los campos obligatorios antes de enviar la petición al backend.
- [ ] La validación de DNI vía API RENIEC retorna el resultado en tiempo real durante el registro.
- [ ] El código de tracking generado es único y no se repite en la base de datos.
- [ ] La tabla de envíos muestra correctamente el estado actual de cada paquete con paginación funcional.
- [ ] El cambio de estado de un envío se refleja en tiempo real en el panel sin recargar la página.
- [ ] El Operario no puede acceder a funcionalidades exclusivas del Administrador (gestión de usuarios, sucursales, reportes).
- [ ] Los reportes PDF se generan correctamente y son descargables en el navegador.

### Módulo de Tracking Público

- [ ] El campo de búsqueda realiza la consulta a la API sin recargar la página.
- [ ] La tarjeta de resultado muestra correctamente los datos del paquete y el estado actual.
- [ ] La barra de progreso refleja visualmente el estado con el porcentaje y color correspondiente.
- [ ] El sistema muestra un mensaje de error claro si el código ingresado no existe.

### Integración y Despliegue

- [ ] El sistema levanta correctamente mediante Docker Compose en un entorno limpio.
- [ ] La API REST responde con códigos de estado HTTP correctos (200, 201, 400, 401, 403, 404).
- [ ] Las notificaciones por correo se envían correctamente al crear un envío y al actualizar su estado.
- [ ] Las variables de entorno sensibles no están expuestas en el código fuente del repositorio.

---

## 9. Modelo de Entidades del Sistema

### 9.1 Entidad: Usuario

Base del sistema de autenticación y roles. Representa a los usuarios internos del sistema.

```typescript
interface Usuario {
  id: string;            // UUID (PK)
  nombre: string;
  email: string;         // único
  passwordHash: string;
  rol: RolUsuario;       // FK → RolUsuario
  estado: boolean;       // activo / inactivo
  sucursalId: string;    // FK → Sucursal
  creadoEn: Date;
  actualizadoEn: Date;
}
```

**Relaciones:**
- Un Usuario pertenece a una Sucursal (N:1)
- Un Usuario puede registrar múltiples Envíos (1:N)
- Un Usuario puede generar múltiples registros en HistorialEstado (1:N)

---

### 9.2 Entidad: Sucursal

Define las sucursales logísticas del sistema. Actúa como punto de origen y destino de los envíos.

```typescript
interface Sucursal {
  id: string;       // UUID (PK)
  nombre: string;
  codigo: string;   // único
  direccion: string;
  telefono: string;
  estado: boolean;
}
```

**Relaciones:**
- Una Sucursal puede ser origen de múltiples Envíos (1:N)
- Una Sucursal puede ser destino de múltiples Envíos (1:N)
- Una Sucursal puede tener múltiples Usuarios asignados (1:N)

---

### 9.3 Entidad: Envío

Entidad central del dominio. Representa un paquete registrado en el sistema.

```typescript
interface Envio {
  id: string;                 // UUID (PK)
  guia: string;               // único
  codigoTracking: string;     // único
  origen: string;
  destino: string;
  remitenteNombre: string;
  remitenteTelefono: string;
  destinatarioNombre: string;
  destinatarioTelefono: string;
  peso: number;               // Decimal
  dimensiones: string;
  tipoServicio: string;
  estadoActualId: string;     // FK → EstadoEnvio
  sucursalOrigenId: string;   // FK → Sucursal
  sucursalDestinoId: string;  // FK → Sucursal
  creadoPor: string;          // FK → Usuario
  creadoEn: Date;
  actualizadoEn: Date;
}
```

**Métodos:**
- `generarGuia(): string`
- `generarCodigoTracking(): string`

**Relaciones:**
- Un Envío pertenece a un Usuario que lo registró (N:1)
- Un Envío tiene un EstadoEnvio actual (N:1)
- Un Envío tiene múltiples registros en HistorialEstado (1:N)
- Un Envío puede generar múltiples Notificaciones (1:N)

---

### 9.4 Entidad: EstadoEnvio

Catálogo de estados posibles para un envío. Inmutable en producción.

```typescript
interface EstadoEnvio {
  id: string;           // UUID (PK)
  nombre: string;       // 'Recibido' | 'En Viaje' | 'Entregado'
  descripcion: string;
  esEstadoFinal: boolean;
}
```

---

### 9.5 Entidad: HistorialEstado

Registra cada cambio de estado de un envío, generando el historial completo de trazabilidad. **Esta entidad es inmutable una vez creada.**

```typescript
interface HistorialEstado {
  id: string;           // UUID (PK)
  envioId: string;      // FK → Envio
  estadoId: string;     // FK → EstadoEnvio
  observacion?: string;
  fechaHora: Date;
  registradoPor: string; // FK → Usuario
}
```

**Relaciones:**
- Pertenece a un Envío (N:1)
- Pertenece al Usuario que ejecutó el cambio (N:1)

---

### 9.6 Entidad: Notificacion

Registra las notificaciones enviadas automáticamente por el sistema.

```typescript
interface Notificacion {
  id: string;                      // UUID (PK)
  envioId: string;                 // FK → Envio
  tipo: TipoNotificacion;
  destinatario: string;            // email
  asunto: string;
  mensaje: string;
  estado: EstadoNotificacion;
  enviadoEn: Date;
}

enum TipoNotificacion {
  CREACION_ENVIO = 'CREACION_ENVIO',
  ACTUALIZACION_ESTADO = 'ACTUALIZACION_ESTADO',
  ENTREGA_EXITOSA = 'ENTREGA_EXITOSA',
  ALERTA = 'ALERTA',
  OTRO = 'OTRO'
}

enum EstadoNotificacion {
  PENDIENTE = 'PENDIENTE',
  ENVIADO = 'ENVIADO',
  FALLIDO = 'FALLIDO'
}
```

---

## 10. Diagramas UML del Sistema

El proyecto incluye los siguientes diagramas UML como parte de la documentación técnica:

### 10.1 Diagrama de Casos de Uso

**Archivo:** `Diagrama_de_Casos_de_Uso_RutaSync.png`

Muestra los tres actores (Cliente Público, Operario, Administrador) y sus interacciones:
- `Consultar Tracking de Envío` [Consulta pública — sin autenticación]
- `Iniciar Sesión` [Autenticación JWT — incluido por todas las operaciones internas]
- `Registrar Nuevo Envío` [Operación Interna — `<<include>>` Iniciar Sesión]
- `Actualizar Estado Logístico` [Operación Interna — `<<include>>` Iniciar Sesión]
- `Generar Ticket PDF` [Operación Interna — `<<include>>` Iniciar Sesión]
- `Gestionar Usuarios y Sucursales` [Acceso exclusivo Administrador]

### 10.2 Diagrama de Clases — Capa Frontend

**Archivo:** `Diagrama_de_clases_-_Aplicación_web_frontend.png`

Tecnologías: React.js + TypeScript | Estado: Context API / Hooks | HTTP: Axios | UI: Tailwind CSS

**Módulo de Autenticación:**
- `LoginPage` → `AuthService` → `ApiService` → `StorageService`

**Módulo de Dashboard (Vistas principales):**
- `DashboardPage`, `EnviosPage`, `RegistroEnvioPage`, `DetalleEnvioPage`, `UsuariosPage`, `ReportesPage`

**Servicios por Dominio (consumen API):**
- `EnvioService`, `SucursalService`, `UsuarioService`, `ReporteService`, `NotificaciónService`

**Componentes UI Compartidos:**
- `LayoutComponent`, `SidebarComponent`, `ProtectedRoute`

**Modelos (Interfaces / Types):**
- `User`, `RolUsuario`, `Sucursal`, `Envio`, `EstadoEnvio`, `HistorialEstado`, `Notificacion`, `TipoNotificacion`, `EstadoNotificacion`

### 10.3 Diagrama de Clases — Capa Backend

**Archivo:** `Diagrama_de_clases_para_Capa_Backend.png`

Entidades con atributos, métodos y multiplicidades:
- `Usuario` (1) ←→ (*) `RolUsuario`
- `Usuario` (*) ←→ (1) `Sucursal`
- `Envio` (*) ←→ (1) `EstadoEnvio`
- `Envio` (1) ←→ (*) `HistorialEstado`
- `HistorialEstado` (*) ←→ (1) `Usuario` [registrado por]
- `Envio` (1) ←→ (*) `Notificacion`
- Enumerados: `TipoNotificacion`, `EstadoNotificacion`

### 10.4 Diagrama de Componentes — Sistema de Seguridad

**Archivo:** `Diagrama_de_componentes_-_Sistema_de_seguridad.png`

```
[Interfaz Web: React + TypeScript]
        │ IUI (Interfaz de Usuario)
        ▼ usa → IAPI (API REST)
[API Gateway: Node.js + Express / Nginx]
    │                    │
    usa                  usa
    ▼                    ▼
[Servicio Auth: JWT]  [Servicio Notificaciones: Nodemailer]
    │ IAuth               │ INotificaciones
[API Gateway]
    │         │
    usa       usa
    ▼         ▼
[IData]    [IStorage]
    │              │
[Base de Datos: MySQL]  [Almacenamiento: Servidor/Disco]
```

### 10.5 Diagrama de Secuencia — Login y Autenticación JWT

**Archivo:** `Diagrama_de_secuencia_para_autenticación_JWT.png`

**Participantes:** Usuario → Frontend (React) → API Gateway (Nginx) → Auth Service (Node.js/Express) → User Service (MySQL) → Redis (Invalidación JWT)

**Flujo:**
1. Usuario ingresa credenciales (email, contraseña)
2. Frontend: `POST /api/auth/login` (email, contraseña)
3. API Gateway reenvía solicitud al Auth Service
4. Auth Service verifica usuario en MySQL por email
5. MySQL retorna usuario (datos, hash)
6. Auth Service valida contraseña con Bcrypt
7. Auth Service genera JWT (firmado con secret)
8. *(Opcional)* Almacena token en Redis (lista negra si aplica)
9. Redis confirma
10. Auth Service retorna JWT (accessToken) al API Gateway
11. API Gateway retorna JWT al Frontend
12. Frontend almacena JWT en localStorage / cookie

> **Notas:**
> - El JWT contiene los claims del usuario y se firma con un secret.
> - En cada petición posterior, el cliente debe enviar el JWT en el header: `Authorization: Bearer <token>`
> - El token puede ser invalidado almacenándolo en Redis (lista negra) al cerrar sesión.

### 10.6 Diagrama de Secuencia — Registro de Envío con DNI

**Archivo:** `Diagrama_de_Secuencia_para_Registro_de_Envío_con_DNI.png`

**Participantes:** Empleado → Frontend (React) → API Gateway (Node.js/Express) → Shipment Service → User Service (MySQL) → Tracking Service (MySQL) → Notification Service (MySQL)

**Flujo:**
1. Empleado ingresa datos del envío (DNI del destinatario y datos del paquete)
2. Frontend: `POST /api/shipments` (datos del envío)
3. API Gateway reenvía solicitud al Shipment Service
4. Shipment Service valida DNI del destinatario via User Service (API RENIEC)
5. User Service retorna resultado de validación (DNI válido / inválido)
6. *[Si DNI inválido]* Retorna error de validación → flujo termina
7. Shipment Service crea registro de envío en MySQL (estado = REGISTRADO)
8. MySQL confirma creación (ID de envío)
9. Shipment Service publica evento de nuevo envío en MySQL (tabla de eventos)
10. Notification Service confirma publicación
11. Shipment Service responde con envío registrado al API Gateway
12. API Gateway retorna respuesta de éxito al Frontend
13. Frontend muestra confirmación al empleado

> **Notas:**
> - El DNI se valida consultando el User Service (que a su vez consulta la API RENIEC).
> - Si el DNI no existe o es inválido, se retorna error y no se crea el envío.
> - Al crearse el envío, se publica un evento en MySQL (tabla de eventos) para procesamiento asíncrono (notificaciones, actualización de estados, etc.).

### 10.7 Diagrama de Actividades — Registro con API RENIEC

**Archivo:** `Diagrama_de_actividades_para_registro_de_envío.png`

**Carriles:** Operario | Sistema RutaSync | API RENIEC (Validación de DNI)

**Flujo:**
1. Operario selecciona "Registrar Nuevo Envío"
2. Sistema muestra formulario de registro
3. Operario completa datos del envío
4. Sistema valida datos obligatorios
   - ❌ Datos inválidos → muestra errores de validación → vuelve al paso 3
5. Sistema envía DNI del destinatario a API RENIEC
6. API RENIEC valida DNI
   - ❌ DNI inválido → responde "DNI inválido" → Sistema muestra error → Operario corrige
   - ✅ DNI válido → responde "DNI válido"
7. Sistema muestra mensaje: "DNI válido. Verificar información."
8. Sistema guarda envío en la base de datos
9. Sistema genera número de guía y código de tracking
10. Sistema confirma registro exitoso
11. Operario ve confirmación y detalle del envío registrado

> **Nota:** La comunicación con la API RENIEC se realiza vía REST (HTTPS).

### 10.8 Diagrama de Actividades — Generación de Reporte PDF

**Archivo:** `Diagrama_de_actividades_para_reporte_PDF.png`

**Carriles:** Usuario | Sistema

**Flujo:**
1. Usuario selecciona opción "Generar Reporte"
2. Sistema valida permisos del usuario
   - ❌ Sin permisos → muestra "Acceso denegado" → fin
   - ✅ Con permisos → continúa
3. Sistema obtiene parámetros del reporte (filtros, rango de fechas, tipo, etc.)
4. Sistema consulta datos en la Base de Datos MySQL
5. Sistema procesa y estructura la información para el reporte
6. Sistema genera documento PDF (Librería: pdfmake / PDFKit)
7. Sistema almacena el archivo PDF temporalmente en servidor
8. Sistema devuelve el archivo PDF al usuario (descarga / vista)
9. Usuario descarga o visualiza el reporte PDF

---

## 11. Arquitectura del Sistema

### 11.1 Stack Tecnológico Completo

#### Frontend

| Tecnología | Uso |
|-----------|-----|
| React.js + TypeScript | Framework principal (SPA) |
| Vite | Bundler (HMR, compilación optimizada) |
| Tailwind CSS | Estilos utilitarios |
| Axios | Cliente HTTP para peticiones a la API |
| React Router | Enrutamiento client-side |
| Context API / Hooks | Gestión de estado global |

#### Backend

| Tecnología | Uso |
|-----------|-----|
| Node.js + Express.js | Runtime y framework de la API REST |
| Nginx | Proxy inverso / API Gateway |
| JWT (jsonwebtoken) | Autenticación y autorización |
| Bcrypt | Encriptación de contraseñas |
| Redis | Invalidación de tokens (blacklist) |
| PDFKit / pdfmake | Generación de reportes PDF |
| Nodemailer | Envío de notificaciones por correo |
| dotenv | Gestión de variables de entorno |

#### Base de Datos

| Tecnología | Uso |
|-----------|-----|
| MySQL | Base de datos relacional principal |
| Sequelize | ORM (abstracción SQL + migraciones) |
| Redis | Caché y blacklist de tokens JWT |

#### DevOps / Despliegue

| Tecnología | Uso |
|-----------|-----|
| Docker | Contenerización de servicios |
| Docker Compose | Orquestación de contenedores |

#### APIs Externas

| Servicio | Uso | Protocolo |
|---------|-----|-----------|
| RENIEC | Validación de DNI | REST / HTTPS |

---

### 11.2 Arquitectura por Capas (Backend)

```
┌─────────────────────────────────────────┐
│          CAPA DE PRESENTACIÓN           │
│   Controladores Express (rutas HTTP)    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│          CAPA DE APLICACIÓN             │
│    Servicios de dominio (lógica de      │
│    negocio: AuthService, EnvioService,  │
│    ReporteService, NotificaciónService) │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│            CAPA DE DOMINIO              │
│    Entidades y reglas de negocio        │
│    (Usuario, Envio, EstadoEnvio, etc.)  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│            CAPA DE DATOS                │
│    Repositorios ORM (Sequelize) + MySQL │
└─────────────────────────────────────────┘
```

### 11.3 Contenedores Docker

```yaml
# docker-compose.yml (estructura)
services:
  rutasync-frontend:   # React + Vite (servido por Nginx)
    ports: ["3000:80"]

  rutasync-backend:    # Node.js + Express
    ports: ["3001:3001"]
    depends_on: [rutasync-db, rutasync-redis]

  rutasync-db:         # MySQL
    ports: ["3306:3306"]
    volumes: [db_data:/var/lib/mysql]

  rutasync-redis:      # Redis (JWT blacklist)
    ports: ["6379:6379"]
```

### 11.4 Endpoints REST Principales

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/login` | Autenticación de usuario | Público |
| `POST` | `/api/auth/logout` | Cierre de sesión (invalida JWT) | Autenticado |
| `GET` | `/api/tracking/:codigo` | Consulta pública de envío por tracking | Público |
| `GET` | `/api/shipments` | Listado paginado de envíos | Autenticado |
| `POST` | `/api/shipments` | Registrar nuevo envío | Autenticado |
| `GET` | `/api/shipments/:id` | Detalle de un envío | Autenticado |
| `PATCH` | `/api/shipments/:id/estado` | Actualizar estado logístico | Autenticado |
| `DELETE` | `/api/shipments/:id` | Baja lógica de envío | Admin |
| `GET` | `/api/users` | Listado de usuarios | Admin |
| `POST` | `/api/users` | Crear usuario interno | Admin |
| `PATCH` | `/api/users/:id` | Actualizar usuario | Admin |
| `PATCH` | `/api/users/:id/estado` | Activar/Desactivar usuario | Admin |
| `GET` | `/api/sucursales` | Listado de sucursales | Autenticado |
| `POST` | `/api/sucursales` | Crear sucursal | Admin |
| `PATCH` | `/api/sucursales/:id` | Actualizar sucursal | Admin |
| `GET` | `/api/reportes` | Generar reporte PDF | Admin |

---

*Ebert Alonso Valdez Reyes | SENATI — Ingeniería de Software con IA | Arequipa, 2026*
