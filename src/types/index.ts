// El inventario de equipos se administra externamente con Lansweeper.

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
  observaciones: string;
}

export type EstadoAuditoria = 'Conforme' | 'Pendiente de verificar' | 'No conforme';
export type ResultadoRestauracion = 'Exitosa' | 'Fallida' | 'No realizada';

// Cada registro es una revisión de evidencia de un respaldo.
// El respaldo lo ejecuta una herramienta externa (p. ej. Windows Server Backup), no esta aplicación.
export interface Respaldo {
  id: string;
  sistema: string;
  herramienta: string;
  responsable: string;
  frecuenciaEsperada: string;
  fechaProgramada: string;
  fechaUltimoRespaldo: string;
  respaldoEjecutado: boolean;
  evidenciaDisponible: boolean;
  tipoEvidencia: string;
  ubicacionEvidencia: string;
  ultimaPruebaRestauracion: string;
  resultadoRestauracion: ResultadoRestauracion;
  revisadoPor: string;
  fechaRevision: string;
  estadoAuditoria: EstadoAuditoria;
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
