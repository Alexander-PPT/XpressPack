export type Role = 'ADMIN' | 'OPERARIO';

export type ShipmentStatus = 'Recibido' | 'En Viaje' | 'Entregado';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  sucursalId?: string | null;
  estado?: boolean;
}

export interface Sucursal {
  id: string;
  nombre: string;
  codigo: string;
  ciudad?: string;
  departamento?: string;
  direccion: string;
  telefono?: string;
  estado?: boolean;
}

export interface EstadoEnvio {
  id: string;
  nombre: ShipmentStatus;
  descripcion?: string;
  codigo: number;
  progreso: number;
  color: string;
  esEstadoFinal: boolean;
}

export interface HistorialEstado {
  id: string;
  envioId: string;
  estado: EstadoEnvio;
  observacion?: string;
  fechaHora: string;
  registradoPor: User;
}

export interface Shipment {
  id: string;
  guia: string;
  codigoTracking: string;
  estadoActual: EstadoEnvio;
  estado?: ShipmentStatus; // Fallback field
  createdAt?: string;
  fechaEntrega?: string;
  remitenteNombre: string;
  remitenteDni: string;
  remitenteTelefono?: string;
  destinatarioNombre: string;
  destinatarioDni: string;
  destinatarioTelefono?: string;
  peso: number;
  dimensiones: string;
  tipoServicio: string;
  descripcion?: string | null;
  sucursalOrigen?: string | null;
  sucursalDestino?: string | null;
  sucursalOrigenId?: string;
  sucursalDestinoId?: string;
  creadoEn?: string;
  actualizadoEn?: string;
  historial?: HistorialEstado[];
}

export interface CreateEnvioRequest {
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

export interface Notification {
  id: string;
  tipo: string;
  destinatario: string;
  asunto: string;
  mensaje: string;
  estado: string;
  enviadoEn?: string;
}
