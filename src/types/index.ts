export type EstadoEquipo = 'Operativo' | 'Requiere revisión' | 'Mantenimiento' | 'Obsoleto';

export interface Equipo {
  id: string;
  nombre: string;
  area: string;
  usuarioResponsable: string;
  tipo: string;
  marca: string;
  modelo: string;
  procesador: string;
  ram: string;
  almacenamiento: string;
  sistemaOperativo: string;
  fechaAdquisicion: string;
  antivirus: string;
  ultimaRevision: string;
  estado: EstadoEquipo;
  observaciones: string;
}

export type TipoCuenta = 'Individual' | 'Compartida';
export type EstadoAcceso = 'Activo' | 'Pendiente de revisión' | 'Revocado';

// Nota: por seguridad este módulo NO almacena contraseñas.
export interface Acceso {
  id: string;
  usuario: string;
  area: string;
  equipoSistema: string;
  tipoAcceso: string;
  autorizadoPor: string;
  fechaCreacion: string;
  ultimaRevision: string;
  privilegiosAdministrativos: boolean;
  tipoCuenta: TipoCuenta;
  estado: EstadoAcceso;
}

export type EstadoRespaldo = 'Correcto' | 'Pendiente de validar' | 'Fallido';
export type ResultadoRestauracion = 'Exitosa' | 'Fallida' | 'No realizada';

export interface Respaldo {
  id: string;
  sistemaEquipo: string;
  responsable: string;
  automatico: boolean;
  frecuencia: string;
  medio: string;
  ubicacion: string;
  ultimoRespaldo: string;
  ultimaPruebaRestauracion: string;
  resultadoRestauracion: ResultadoRestauracion;
  estado: EstadoRespaldo;
  observaciones: string;
}

export type EstadoProveedor = 'Activo' | 'Revisión pendiente' | 'Vencido';
export type EstadoIncidencia = 'Abierta' | 'En proceso' | 'Resuelta';

export interface Incidencia {
  id: string;
  fecha: string;
  problema: string;
  estado: EstadoIncidencia;
  fechaSolucion: string;
}

export interface Proveedor {
  id: string;
  proveedor: string;
  servicio: string;
  responsableInterno: string;
  contacto: string;
  contratoDisponible: boolean;
  fechaInicio: string;
  fechaVencimiento: string;
  tiempoRespuesta: string;
  accesoRemoto: boolean;
  estado: EstadoProveedor;
  observaciones: string;
  incidencias: Incidencia[];
}

export type TipoRiesgo = 'Riesgo' | 'Hallazgo';
export type NivelRiesgo = 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
export type EstadoRiesgo = 'Abierto' | 'En proceso' | 'Atendido' | 'Aceptado';

export interface Riesgo {
  id: string;
  codigo: string;
  tipo: TipoRiesgo;
  nombre: string;
  descripcion: string;
  area: string;
  probabilidad: number; // porcentaje 0-100
  impacto: number; // 1-5
  puntuacion: number;
  nivel: NivelRiesgo;
  evidencia: string;
  recomendacion: string;
  responsable: string;
  fechaCompromiso: string;
  estado: EstadoRiesgo;
}
