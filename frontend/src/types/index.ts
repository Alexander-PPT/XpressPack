export type Role = 'ADMIN' | 'OPERARIO';

export type ShipmentStatus = 'Recibido' | 'En Viaje' | 'Entregado';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  sucursalId?: string | null;
  estado?: boolean;
  createdAt?: string;
}

export interface Sucursal {
  id: string;
  nombre: string;
  codigo: string;
  ciudad: string;
  departamento: string;
  direccion: string;
  telefono?: string;
  email?: string;
  encargado?: string;
  estado?: boolean;
}

export interface Shipment {
  id: string;
  guia: string;
  codigoTracking: string;
  estado: ShipmentStatus;
  remitenteDni?: string;
  destinatarioDni?: string;
  remitenteNombre: string;
  destinatarioNombre: string;
  remitenteEmail?: string;
  destinatarioEmail?: string;
  tipoServicio: string;
  peso?: number;
  dimensiones?: string;
  valorDeclarado?: number;
  descripcion?: string | null;
  sucursalOrigen?: string | null;
  sucursalDestino?: string | null;
  createdAt?: string;
  fechaEntrega?: string | null;
  fechaUltimoEstado?: string;
  sucursalOrigenId?: string;
  sucursalDestinoId?: string;
  estadoActual?: { nombre: ShipmentStatus };
  historial?: Array<{
    id: string;
    fechaHora: string;
    estado: { nombre: ShipmentStatus };
    registradoPor: { nombre: string };
    observacion?: string | null;
  }>;
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
  valorDeclarado?: number;
}

export interface Notification {
  id: string;
  tipo: string;
  destinatarioEmail: string;
  estado: string;
  createdAt: string;
}
