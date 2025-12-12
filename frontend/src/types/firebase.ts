// Tipo para Categoría
export interface Categoria {
  id: string;
  nombre: string;
  icono: string; 
}

// Tipo para Reserva básica según tu Firestore
export interface Reserva {
  id: string;
  clienteId: string;
  estado: "confirmada" | "cancelada" | string;
  fecha: string; // yyyy-mm-dd
  hora: string;  // hh:mm
  negocioId: string;
  servicioId: string;
}

// Tipo extendido que incluye nombres del negocio y servicio
export interface ReservaExtendida extends Reserva {
  negocioNombre?: string;
  servicioNombre?: string;
}

