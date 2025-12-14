// region Cliente

import type { Timestamp } from "firebase/firestore";

// Tipo para Categoría
export interface Categoria {
  id: string;
  nombre: string;
  icono: string; 
}

// Tipo para Reserva básica según tu Firestore
export interface Reserva {
  id: string;
  nombreCliente: string;
  nombreServicio: string;
  inicio: Timestamp;
  fin: Timestamp;
  estado: string;
}
  
// Tipo extendido que incluye nombres del negocio y servicio
export interface ReservaExtendida extends Reserva {
  negocioNombre?: string;
  servicioNombre?: string;
}
// end region


// region Negocio
// Tipo para Negocio
export interface Negocio {
  id: string;
  nombre: string;
  direccion: string;
  descripcion: string;
  horarios?: HorariosSemana;
}

export interface Servicio {
  id: string;
  nombre: string;
  duracion: number;
  precio: number;
  negocioId: string;
}
// end region

// Horarios
export interface TramoHorario {
  inicio: string; // "09:00"
  fin: string;    // "14:00"
}

export interface HorarioDia {
  activo: boolean;
  tramos: { inicio: string; fin: string }[];
}

export interface HorariosSemana {
  lunes: HorarioDia;
  martes: HorarioDia;
  miercoles: HorarioDia;
  jueves: HorarioDia;
  viernes: HorarioDia;
  sabado: HorarioDia;
  domingo: HorarioDia;
}
