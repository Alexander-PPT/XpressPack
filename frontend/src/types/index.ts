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
  remitenteNombre: string;
  destinatarioNombre: string;
  remitenteEmail?: string;
  destinatarioEmail?: string;
  tipoServicio: string;
  descripcion?: string | null;
  sucursalOrigen?: string | null;
  sucursalDestino?: string | null;
  createdAt?: string;
  fechaEntrega?: string | null;
  fechaUltimoEstado?: string;
  sucursalOrigenId?: string;
  sucursalDestinoId?: string;
}

export interface Notification {
  id: string;
  tipo: string;
  destinatarioEmail: string;
  estado: string;
  createdAt: string;
}
