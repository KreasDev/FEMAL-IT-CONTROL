import type { Acceso, Proveedor, Respaldo } from '../types';
import { KEYS, readList, writeList } from '../services/storage';
import { haceDias } from '../services/rules';

// Las fechas son relativas a hoy para que las alertas siempre tengan sentido en la demo.

const accesos: Acceso[] = [
  { id: 'ac1', usuario: 'admin.servidor', area: 'Infraestructura', equipoSistema: 'Servidor principal', tipoAcceso: 'Administrador local', autorizadoPor: 'Gerente General', fechaCreacion: '2020-03-20', ultimaRevision: haceDias(30), privilegiosAdministrativos: true, tipoCuenta: 'Individual', estado: 'Activo', observaciones: 'Cuenta individual del administrador.' },
  { id: 'ac2', usuario: 'contabilidad', area: 'Contabilidad', equipoSistema: 'CONTPAQ', tipoAcceso: 'Usuario de aplicación', autorizadoPor: 'Gerente General', fechaCreacion: '2021-06-15', ultimaRevision: haceDias(150), privilegiosAdministrativos: false, tipoCuenta: 'Compartida', estado: 'Pendiente de revisión', observaciones: 'Cuenta compartida: evaluar crear cuentas individuales.' },
  { id: 'ac3', usuario: 'jlopez', area: 'Contabilidad', equipoSistema: 'Sistema de facturación', tipoAcceso: 'Emisor de CFDI', autorizadoPor: 'Gerente General', fechaCreacion: '2022-01-15', ultimaRevision: haceDias(45), privilegiosAdministrativos: false, tipoCuenta: 'Individual', estado: 'Activo', observaciones: '' },
  { id: 'ac4', usuario: 'soporte.externo', area: 'Proveedor', equipoSistema: 'Servidor principal (escritorio remoto)', tipoAcceso: 'Acceso remoto', autorizadoPor: 'Gerente General', fechaCreacion: '2020-04-01', ultimaRevision: haceDias(210), privilegiosAdministrativos: true, tipoCuenta: 'Compartida', estado: 'Pendiente de revisión', observaciones: 'Acceso remoto del proveedor de soporte; validar si sigue siendo necesario.' },
  { id: 'ac5', usuario: 'recepcion', area: 'Administración', equipoSistema: 'Equipo de Recepción', tipoAcceso: 'Usuario estándar', autorizadoPor: 'Contador General', fechaCreacion: '2023-04-05', ultimaRevision: haceDias(15), privilegiosAdministrativos: false, tipoCuenta: 'Individual', estado: 'Activo', observaciones: '' },
];

const respaldos: Respaldo[] = [
  { id: 'rs1', sistema: 'Servidor principal', herramienta: 'Windows Server Backup', responsable: 'Gerente General', frecuenciaEsperada: 'Diaria', fechaProgramada: haceDias(1), fechaUltimoRespaldo: haceDias(1), respaldoEjecutado: true, evidenciaDisponible: true, tipoEvidencia: 'Registro de Windows Server Backup', ubicacionEvidencia: 'Visor de eventos del servidor', ultimaPruebaRestauracion: '', resultadoRestauracion: 'No realizada', revisadoPor: 'Gerente General', fechaRevision: haceDias(1), estadoAuditoria: 'Conforme', observaciones: 'El respaldo automático se encuentra configurado; pendiente realizar prueba periódica de restauración.' },
  { id: 'rs2', sistema: 'Información de Contabilidad', herramienta: 'Sincronización automática', responsable: 'Gerente General', frecuenciaEsperada: 'Automática', fechaProgramada: '', fechaUltimoRespaldo: haceDias(3), respaldoEjecutado: true, evidenciaDisponible: false, tipoEvidencia: '', ubicacionEvidencia: '', ultimaPruebaRestauracion: '', resultadoRestauracion: 'No realizada', revisadoPor: '', fechaRevision: '', estadoAuditoria: 'Pendiente de verificar', observaciones: 'Evidencia pendiente de comprobar.' },
];

const hoy = new Date().getFullYear();
const proveedores: Proveedor[] = [
  { id: 'pv1', proveedor: 'TecnoSoporte del Bajío', servicio: 'Soporte técnico', responsableInterno: 'Gerente General', contacto: 'soporte@tecnosoporte.mx · 477 123 4567', contratoDisponible: true, fechaInicio: `${hoy - 1}-01-01`, fechaVencimiento: `${hoy}-12-31`, tiempoRespuesta: '24 horas', accesoRemoto: true, estado: 'Activo', observaciones: 'Cuenta con acceso remoto al servidor.',
    incidencias: [
      { id: 'in1', fecha: haceDias(20), problema: 'Lentitud en equipo de Contabilidad', estado: 'En proceso', fechaSolucion: '' },
      { id: 'in2', fecha: haceDias(60), problema: 'Falla de impresora en red', estado: 'Resuelta', fechaSolucion: haceDias(58) },
    ] },
  { id: 'pv2', proveedor: 'FacturaFácil PAC', servicio: 'Facturación electrónica', responsableInterno: 'Contador General', contacto: 'atencion@facturafacil.mx', contratoDisponible: true, fechaInicio: `${hoy - 2}-03-01`, fechaVencimiento: haceDias(-20), tiempoRespuesta: '4 horas', accesoRemoto: false, estado: 'Revisión pendiente', observaciones: 'Renovación anual del paquete de timbres.', incidencias: [] },
  { id: 'pv3', proveedor: 'VolumeTrack Soluciones', servicio: 'Control volumétrico', responsableInterno: 'Gerente General', contacto: 'contacto@volumetrack.mx', contratoDisponible: false, fechaInicio: `${hoy - 3}-05-01`, fechaVencimiento: haceDias(15), tiempoRespuesta: '48 horas', accesoRemoto: true, estado: 'Vencido', observaciones: 'No se localizó copia del contrato firmado.', incidencias: [] },
];

/** Carga los datos demo solo si nunca se han inicializado. */
export function initDemoData(force = false): void {
  // Limpia claves de módulos retirados: Equipos (ahora en Lansweeper) y Riesgos (en el documento de auditoría)
  localStorage.removeItem('femal_equipos');
  localStorage.removeItem('femal_riesgos');
  if (!force && localStorage.getItem(KEYS.initialized)) {
    // Migración: los respaldos con el formato anterior se reemplazan por las revisiones demo
    const guardados = readList<Partial<Respaldo>>(KEYS.respaldos);
    if (guardados.some((r) => !('estadoAuditoria' in r))) writeList(KEYS.respaldos, respaldos);
    return;
  }
  writeList(KEYS.accesos, accesos);
  writeList(KEYS.respaldos, respaldos);
  writeList(KEYS.proveedores, proveedores);
  localStorage.setItem(KEYS.initialized, new Date().toISOString());
}
