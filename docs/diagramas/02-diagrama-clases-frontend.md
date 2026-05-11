# Diagrama de Clases — Capa Frontend (Aplicación Web)

**Archivo de referencia:** `Diagrama_de_clases_-_Aplicación_web_frontend.png`

---

## 📊 Descripción General

El diagrama de clases del frontend representa la arquitectura de la aplicación React + TypeScript. Muestra la organización en módulos, componentes, servicios, y las relaciones de dependencia entre ellos. La estructura sigue el patrón de **componentes funcionales** con **hooks** y **Context API** para gestión de estado.

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│               APLICACIÓN REACT + TYPESCRIPT                 │
├─────────────────────────────────────────────────────────────┤
│                     MÓDULO PRESENTACIÓN                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Páginas / Componentes Principales           │   │
│  │  (Pages, Layout, Dashboard, Formularios, etc.)       │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │ consumen                                   │
├─────────────────▼──────────────────────────────────────────┤
│             MÓDULO DE SERVICIOS (HOOKS, CONTEXT)           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AuthService, ApiService, StorageService,            │   │
│  │  EnvioService, SucursalService, UsuarioService, etc. │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │ consumen                                   │
├─────────────────▼──────────────────────────────────────────┤
│           CAPA DE UTILITARIOS E INTERFACES (Types)          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tipos TypeScript (interfaces, enums)                │   │
│  │  Utilidades (constantes, formatters, validators)     │   │
│  └──────────────────────────────────────────────────────┘   │
│                 ↓ comunican vía HTTPS (Axios)               │
├─────────────────────────────────────────────────────────────┤
│           API REST (Backend — Node.js + Express)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Módulo de Autenticación

### **LoginPage** (Componente)

```typescript
// Ubicación: src/pages/LoginPage.tsx

interface LoginPageProps {}

interface LoginPageState {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
}

class LoginPage extends React.Component<LoginPageProps, LoginPageState> {
  // Métodos:
  - handleInputChange(): void
  - handleSubmit(): Promise<void>
  - navigateToDashboard(): void
}
```

**Responsabilidades:**
- Renderizar formulario de login (email, contraseña)
- Validar entrada en cliente (formato email, longitud de contraseña)
- Llamar a AuthService.login()
- Almacenar JWT en localStorage/sessionStorage
- Navegar a Dashboard si es exitoso
- Mostrar errores si la autenticación falla

**Dependencias:**
- `AuthService` (login)
- `StorageService` (guardar JWT)
- `React Router` (navegación)

---

### **AuthService** (Servicio)

```typescript
// Ubicación: src/services/AuthService.ts

class AuthService {
  // Métodos públicos:
  
  // Autentica usuario contra /api/auth/login
  login(email: string, password: string): Promise<User>;
  
  // Invalida sesión contra /api/auth/logout
  logout(): Promise<void>;
  
  // Obtiene el JWT almacenado
  getToken(): string | null;
  
  // Valida si JWT es válido y no está expirado
  isTokenValid(): boolean;
  
  // Obtiene usuario actual desde JWT
  getCurrentUser(): User | null;
  
  // Refresca token si es necesario
  refreshToken(): Promise<string>;
}
```

**Responsabilidades:**
- Comunicación con endpoint `/api/auth/login`
- Decodificación del JWT (obteniendo claims: id, email, rol)
- Almacenamiento seguro del token
- Validación de expiración
- Revocación de sesión (logout)

**Dependencias:**
- `ApiService` (peticiones HTTP)
- `StorageService` (persistencia)
- `jwt-decode` (librería para decodificar JWT)

---

### **StorageService** (Servicio)

```typescript
// Ubicación: src/services/StorageService.ts

class StorageService {
  // Métodos:
  
  // Almacena token JWT
  saveToken(token: string): void;
  
  // Obtiene token
  getToken(): string | null;
  
  // Elimina token
  removeToken(): void;
  
  // Almacena usuario
  saveUser(user: User): void;
  
  // Obtiene usuario
  getUser(): User | null;
  
  // Limpia toda la sesión
  clearSession(): void;
}
```

**Responsabilidades:**
- Almacenar/recuperar JWT de localStorage
- Almacenar/recuperar datos de usuario
- Limpiar sesión al logout
- Manejar errores de acceso a storage

---

## 🌐 Servicios Compartidos

### **ApiService** (Cliente HTTP)

```typescript
// Ubicación: src/services/ApiService.ts

class ApiService {
  // Propiedades:
  - baseURL: string = process.env.REACT_APP_API_URL
  - axiosInstance: AxiosInstance
  
  // Métodos:
  
  // GET request
  get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T>;
  
  // POST request
  post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  
  // PUT request
  put<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T>;
  
  // PATCH request
  patch<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T>;
  
  // DELETE request
  delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T>;
  
  // Configura interceptor para agregar JWT a header
  setupInterceptors(): void;
  
  // Maneja error de respuesta (401, 403, 500, etc.)
  handleError(error: AxiosError): void;
}
```

**Responsabilidades:**
- Cliente HTTP basado en Axios
- Configuración de baseURL desde variables de entorno
- Interceptores para agregar JWT automáticamente
- Manejo centralizado de errores
- Retry automático en ciertos casos

**Flujo de Interceptores:**
```
Request Interceptor:
  1. Obtiene token de StorageService
  2. Agrega header: Authorization: Bearer <token>
  3. Envía request

Response Interceptor:
  1. Si status 401 (no autenticado) → redirige a login
  2. Si status 403 (prohibido) → muestra error de permisos
  3. Si status 4xx o 5xx → muestra mensaje de error
  4. Si exitoso → retorna datos
```

---

### **EnvioService** (Servicio Dominio)

```typescript
// Ubicación: src/services/EnvioService.ts

class EnvioService {
  // Métodos:
  
  // Lista envíos del usuario actual con paginación
  getEnvios(page: number, pageSize: number): Promise<PageResponse<Envio>>;
  
  // Obtiene detalle de un envío específico
  getEnvioById(id: string): Promise<Envio>;
  
  // Busca envío por código de tracking (público)
  getEnvioByTracking(codigo: string): Promise<Envio>;
  
  // Crea nuevo envío (valida DNI vía RENIEC)
  createEnvio(data: CreateEnvioRequest): Promise<Envio>;
  
  // Actualiza estado logístico de envío
  updateEnvioEstado(id: string, nuevoEstado: EstadoEnvio): Promise<Envio>;
  
  // Obtiene historial de cambios de estado
  getEnvioHistorial(id: string): Promise<HistorialEstado[]>;
  
  // Elimina (baja lógica) un envío
  deleteEnvio(id: string): Promise<void>;
}
```

**Responsabilidades:**
- Comunicación con endpoints `/api/shipments`
- Transformación de datos (mapeo entre DTOs y modelos)
- Validación de entradas
- Manejo de errores específicos del dominio

---

### **SucursalService** (Servicio Dominio)

```typescript
// Ubicación: src/services/SucursalService.ts

class SucursalService {
  // Métodos:
  
  // Lista todas las sucursales
  getSucursales(): Promise<Sucursal[]>;
  
  // Obtiene sucursal por ID
  getSucursalById(id: string): Promise<Sucursal>;
  
  // Crea nueva sucursal (solo Admin)
  createSucursal(data: CreateSucursalRequest): Promise<Sucursal>;
  
  // Actualiza sucursal (solo Admin)
  updateSucursal(id: string, data: UpdateSucursalRequest): Promise<Sucursal>;
  
  // Desactiva sucursal (solo Admin)
  deactivateSucursal(id: string): Promise<void>;
}
```

---

### **UsuarioService** (Servicio Dominio)

```typescript
// Ubicación: src/services/UsuarioService.ts

class UsuarioService {
  // Métodos:
  
  // Lista usuarios (solo Admin)
  getUsuarios(): Promise<Usuario[]>;
  
  // Obtiene usuario por ID
  getUsuarioById(id: string): Promise<Usuario>;
  
  // Crea nuevo usuario (solo Admin)
  createUsuario(data: CreateUsuarioRequest): Promise<Usuario>;
  
  // Actualiza usuario (Admin o usuario mismo)
  updateUsuario(id: string, data: UpdateUsuarioRequest): Promise<Usuario>;
  
  // Cambia contraseña
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
  
  // Desactiva usuario (solo Admin)
  deactivateUsuario(id: string): Promise<void>;
}
```

---

### **ReporteService** (Servicio Dominio)

```typescript
// Ubicación: src/services/ReporteService.ts

class ReporteService {
  // Métodos:
  
  // Genera y descarga reporte PDF
  // Parámetros: filtros (fechas, estado, sucursal)
  // Retorna blob de PDF para descarga
  generateReportePDF(filtros: ReporteFiltros): Promise<Blob>;
  
  // Genera y descarga reporte en CSV (alternativa)
  generateReporteCSV(filtros: ReporteFiltros): Promise<Blob>;
}
```

---

### **NotificacionService** (Servicio Dominio)

```typescript
// Ubicación: src/services/NotificacionService.ts

class NotificacionService {
  // Métodos:
  
  // Obtiene notificaciones del usuario
  getNotificaciones(): Promise<Notificacion[]>;
  
  // Marca notificación como leída
  markAsRead(id: string): Promise<void>;
  
  // Obtiene conteo de notificaciones no leídas
  getUnreadCount(): Promise<number>;
}
```

---

## 📄 Módulo de Dashboard (Vistas Principales)

### **DashboardPage** (Componente Contenedor)

```typescript
// Ubicación: src/pages/DashboardPage.tsx

interface DashboardPageProps {}

interface DashboardState {
  enviosRecientes: Envio[];
  estadisticas: DashboardStats;
  loading: boolean;
}

class DashboardPage extends React.Component<DashboardPageProps, DashboardState> {
  // Métodos:
  - componentDidMount(): void  // Carga datos al montar
  - fetchEnvios(): Promise<void>
  - fetchEstadisticas(): Promise<void>
  - render(): JSX.Element
}

interface DashboardStats {
  totalEnvios: number;
  enviosHoy: number;
  enviosEntregados: number;
  enviosEnTransito: number;
}
```

**Responsabilidades:**
- Mostrar resumen ejecutivo
- Listar envíos recientes
- Mostrar gráficos de estadísticas
- Botón de acceso rápido a "Registrar Envío"

---

### **EnviosPage** (Componente Contenedor)

```typescript
// Ubicación: src/pages/EnviosPage.tsx

interface EnviosPageProps {}

interface EnviosPageState {
  envios: Envio[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  loading: boolean;
  filtros: EnvioFiltros;
}

class EnviosPage extends React.Component<EnviosPageProps, EnviosPageState> {
  // Métodos:
  - fetchEnvios(): Promise<void>
  - handlePageChange(page: number): void
  - handleFiltroChange(filtros: EnvioFiltros): void
  - handleSelectEnvio(id: string): void  // Navega a detalle
  - render(): JSX.Element
}

interface EnvioFiltros {
  estado?: EstadoEnvio;
  sucursal?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}
```

**Responsabilidades:**
- Mostrar tabla paginada de envíos
- Filtrar por estado, sucursal, fecha
- Acceso a detalle de envío
- Botón "Registrar Nuevo Envío"

---

### **RegistroEnvioPage** (Componente Contenedor)

```typescript
// Ubicación: src/pages/RegistroEnvioPage.tsx

interface RegistroEnvioPageProps {}

interface RegistroEnvioPageState {
  formData: CreateEnvioRequest;
  validationErrors: ValidationError[];
  dniValidating: boolean;
  dniValid: boolean | null;
  loading: boolean;
}

class RegistroEnvioPage extends React.Component<RegistroEnvioPageProps, RegistroEnvioPageState> {
  // Métodos:
  - handleInputChange(field: string, value: any): void
  - validateDNI(dni: string): Promise<void>  // Valida contra RENIEC
  - handleSubmit(): Promise<void>
  - handleCancel(): void
  - render(): JSX.Element
}

interface CreateEnvioRequest {
  remitenteDni: string;
  remitenteNombre: string;
  destinatarioDni: string;
  destinatarioNombre: string;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  peso: number;
  dimensiones: string;
  tipoServicio: string;
  descripcion: string;
}
```

**Responsabilidades:**
- Formulario con validación en tiempo real
- Validación de DNI vía API RENIEC
- Envío de datos a backend
- Confirmación con código de tracking generado

---

### **DetalleEnvioPage** (Componente Contenedor)

```typescript
// Ubicación: src/pages/DetalleEnvioPage.tsx

interface DetalleEnvioPageProps {
  id: string;  // Obtenido del URL param
}

interface DetalleEnvioPageState {
  envio: Envio | null;
  historial: HistorialEstado[];
  nuevoEstado: EstadoEnvio | null;
  loading: boolean;
  actualizando: boolean;
}

class DetalleEnvioPage extends React.Component<DetalleEnvioPageProps, DetalleEnvioPageState> {
  // Métodos:
  - fetchEnvio(): Promise<void>
  - fetchHistorial(): Promise<void>
  - handleEstadoChange(nuevoEstado: EstadoEnvio): Promise<void>
  - getEstadosDisponibles(): EstadoEnvio[]  // Filtra según flujo
  - render(): JSX.Element
}
```

**Responsabilidades:**
- Mostrar datos completos del envío
- Mostrar historial de cambios de estado
- Selector para actualizar estado (solo estados válidos)
- Botón para volver a listado

---

### **UsuariosPage** (Componente Contenedor) — Solo Admin

```typescript
// Ubicación: src/pages/UsuariosPage.tsx

interface UsuariosPageProps {}

interface UsuariosPageState {
  usuarios: Usuario[];
  loading: boolean;
  showCreateForm: boolean;
  editingId: string | null;
}

class UsuariosPage extends React.Component<UsuariosPageProps, UsuariosPageState> {
  // Métodos:
  - fetchUsuarios(): Promise<void>
  - handleCreateUsuario(data: CreateUsuarioRequest): Promise<void>
  - handleUpdateUsuario(id: string, data: UpdateUsuarioRequest): Promise<void>
  - handleDeactivateUsuario(id: string): Promise<void>
  - render(): JSX.Element
}
```

**Responsabilidades:**
- Listar usuarios internos
- Crear nuevos usuarios
- Editar datos de usuario
- Desactivar usuarios
- **Restricción:** Solo accesible por Administrador

---

### **ReportesPage** (Componente Contenedor) — Solo Admin

```typescript
// Ubicación: src/pages/ReportesPage.tsx

interface ReportesPageProps {}

interface ReportesPageState {
  reporteFiltros: ReporteFiltros;
  generando: boolean;
}

interface ReporteFiltros {
  fechaDesde: Date;
  fechaHasta: Date;
  estado?: EstadoEnvio;
  sucursal?: string;
  formato: 'pdf' | 'csv';
}

class ReportesPage extends React.Component<ReportesPageProps, ReportesPageState> {
  // Métodos:
  - handleGenerarReporte(): Promise<void>
  - handleDownload(blob: Blob, filename: string): void
  - render(): JSX.Element
}
```

**Responsabilidades:**
- Formulario de filtros para reportes
- Generar PDF con datos filtrados
- Descargar/visualizar reporte
- **Restricción:** Solo accesible por Administrador

---

## 🎨 Componentes UI Compartidos

### **LayoutComponent** (Wrapper)

```typescript
// Ubicación: src/components/Layout/LayoutComponent.tsx

interface LayoutComponentProps {
  children: React.ReactNode;
}

export const LayoutComponent: React.FC<LayoutComponentProps> = ({ children }) => {
  // Estructura:
  // <Header />
  //   <Sidebar />
  //   <main>{children}</main>
  // <Footer />
}
```

---

### **SidebarComponent** (Navegación)

```typescript
// Ubicación: src/components/Sidebar/SidebarComponent.tsx

interface SidebarComponentProps {
  collapsed?: boolean;
}

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  requiredRole?: RolUsuario;
}

export const SidebarComponent: React.FC<SidebarComponentProps> = ({ collapsed }) => {
  // Menú dinámico según rol del usuario
  // Items visibles: Operario
  //   - Dashboard
  //   - Envíos
  //   - Registrar Envío
  //   - Perfil
  
  // Items adicionales: Administrador
  //   - Usuarios
  //   - Sucursales
  //   - Reportes
}
```

---

### **ProtectedRoute** (Componente)

```typescript
// Ubicación: src/components/ProtectedRoute.tsx

interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: RolUsuario;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  element, 
  requiredRole 
}) => {
  // Valida:
  // 1. JWT existe y es válido
  // 2. Si requiredRole, valida que usuario tiene ese rol
  // 3. Si no cumple → redirige a /login
  // 4. Si cumple → renderiza elemento
}
```

---

## 📊 Modelos (Interfaces / Types)

### **Entidades del Dominio**

```typescript
// Ubicación: src/types/index.ts

// Usuario
interface User {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  sucursalId: string;
  estado: boolean;
  creadoEn: Date;
}

// Rol de usuario
enum RolUsuario {
  ADMIN = 'ADMIN',
  OPERARIO = 'OPERARIO'
}

// Sucursal
interface Sucursal {
  id: string;
  nombre: string;
  codigo: string;
  direccion: string;
  telefono: string;
  estado: boolean;
}

// Envío
interface Envio {
  id: string;
  guia: string;
  codigoTracking: string;
  origen: string;
  destino: string;
  remitenteNombre: string;
  remitenteTelefono: string;
  destinatarioNombre: string;
  destinatarioTelefono: string;
  peso: number;
  dimensiones: string;
  tipoServicio: string;
  estadoActual: EstadoEnvio;
  sucursalOriginId: string;
  sucursalDestinoId: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

// Estado de envío
interface EstadoEnvio {
  id: string;
  nombre: 'Recibido' | 'En Viaje' | 'Entregado';
  descripcion: string;
  codigo: number;  // 1, 2, 3
  progreso: number;  // 33, 66, 100
  color: string;  // #2E75B6, #E67E22, #27AE60
  esEstadoFinal: boolean;
}

// Historial de estado
interface HistorialEstado {
  id: string;
  envioId: string;
  estado: EstadoEnvio;
  observacion?: string;
  fechaHora: Date;
  registradoPor: User;
}

// Notificación
interface Notificacion {
  id: string;
  envioId: string;
  tipo: TipoNotificacion;
  destinatario: string;
  asunto: string;
  mensaje: string;
  estado: EstadoNotificacion;
  enviadoEn: Date;
  leidoEn?: Date;
}

enum TipoNotificacion {
  CREACION_ENVIO = 'CREACION_ENVIO',
  ACTUALIZACION_ESTADO = 'ACTUALIZACION_ESTADO',
  ENTREGA_EXITOSA = 'ENTREGA_EXITOSA'
}

enum EstadoNotificacion {
  PENDIENTE = 'PENDIENTE',
  ENVIADO = 'ENVIADO',
  FALLIDO = 'FALLIDO'
}
```

---

### **DTOs (Data Transfer Objects)**

```typescript
// Ubicación: src/types/dtos.ts

// Request para crear envío
interface CreateEnvioRequest {
  remitenteDni: string;
  remitenteNombre: string;
  destinatarioDni: string;
  destinatarioNombre: string;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  peso: number;
  dimensiones: string;
  tipoServicio: string;
  descripcion: string;
}

// Request para crear usuario
interface CreateUsuarioRequest {
  nombre: string;
  email: string;
  rol: RolUsuario;
  sucursalId: string;
}

// Response genérica paginada
interface PageResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
```

---

## 🔄 Flujo de Datos (Data Flow)

### **Ejemplo: Registrar Nuevo Envío**

```
User Input (RegistroEnvioPage)
    ↓
Validación Local (TypeScript, React Hooks)
    ↓
Validación DNI (EnvioService → ApiService)
    ↓
POST /api/shipments (ApiService)
    ↓
Backend crea envío, genera tracking
    ↓
Response con envío + código de tracking
    ↓
Almacena en state (setState)
    ↓
Muestra confirmación al usuario
    ↓
Navega a DetalleEnvioPage
```

---

## 🌍 Integraciones Externas

### **API RENIEC (Validación de DNI)**

```
Flujo:
1. Usuario ingresa DNI en formulario
2. RegistroEnvioPage llama a EnvioService.validateDNI()
3. EnvioService → ApiService → POST /api/shipments/validate-dni
4. Backend integra con API RENIEC (HTTPS)
5. Retorna resultado: válido/inválido
6. Frontend actualiza UI (ícono, mensaje)
```

---

## 📡 Patrones de Comunicación

### **Request Típica con JWT**

```
Headers:
  Authorization: Bearer eyJhbGc...
  Content-Type: application/json

Ejemplo:
POST /api/shipments
Authorization: Bearer <token>
{
  "remitenteDni": "12345678",
  "remitenteNombre": "Juan Pérez",
  ...
}
```

### **Manejo de Errores**

```
Response 4xx o 5xx:
{
  "success": false,
  "message": "Error al registrar envío",
  "errors": [
    { "field": "destinatarioDni", "message": "DNI inválido" }
  ]
}

Frontend:
1. ApiService intercepta error
2. Mapea a tipo específico (ValidationError, NotFoundError, etc.)
3. Componente muestra mensaje al usuario
```

---

## 📋 Resumen de Responsabilidades por Capa

| Capa | Componentes | Responsabilidad |
|------|-------------|-----------------|
| **Presentación** | Pages, Components | Renderizar UI, capturar entrada, navegar |
| **Servicios** | AuthService, EnvioService, etc. | Lógica de negocio, comunicación API |
| **Utilidades** | ApiService, StorageService | HTTP, persistencia, autenticación |
| **Tipos** | Interfaces, Enums | Definiciones TypeScript |

---

## 🔐 Consideraciones de Seguridad Frontend

1. **JWT:** Almacenado en localStorage (vulnerable a XSS), considerar httpOnly cookie
2. **CORS:** Configurado en ApiService
3. **HTTPS:** Requerido para transmisión de JWT
4. **Validación:** Frontend (UX) + Backend (seguridad)
5. **Sanitización:** Escapar contenido dinámico en React (previene XSS)

---

## 📝 Conclusión

El diagrama de clases del frontend muestra una arquitectura modular basada en:
- **Componentes React funcionales** con TypeScript
- **Servicios reutilizables** para lógica compartida
- **Separación de responsabilidades** (Presentación, Servicios, Utilidades)
- **Seguridad mediante JWT** e interceptores
- **Flujos de datos unidireccionales** (componente → servicio → API)

Esta estructura garantiza escalabilidad, mantenibilidad y facilita testing.
