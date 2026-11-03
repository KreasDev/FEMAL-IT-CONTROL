import type { Acceso, Proveedor, Respaldo, Riesgo } from '../types';
import { KEYS, writeList } from '../services/storage';
import { calcularNivel, calcularPuntuacion, haceDias } from '../services/rules';

// Las fechas son relativas a hoy para que las alertas siempre tengan sentido en la demo.

const accesos: Acceso[] = [
  { id: 'ac1', usuario: 'admin.servidor', area: 'Infraestructura', equipoSistema: 'Servidor principal', tipoAcceso: 'Administrador local', autorizadoPor: 'Gerente General', fechaCreacion: '2020-03-20', ultimaRevision: haceDias(30), privilegiosAdministrativos: true, tipoCuenta: 'Individual', estado: 'Activo' },
  { id: 'ac2', usuario: 'contabilidad', area: 'Contabilidad', equipoSistema: 'CONTPAQ', tipoAcceso: 'Usuario de aplicación', autorizadoPor: 'Gerente General', fechaCreacion: '2021-06-15', ultimaRevision: haceDias(150), privilegiosAdministrativos: false, tipoCuenta: 'Compartida', estado: 'Pendiente de revisión' },
  { id: 'ac3', usuario: 'jlopez', area: 'Contabilidad', equipoSistema: 'Sistema de facturación', tipoAcceso: 'Emisor de CFDI', autorizadoPor: 'Gerente General', fechaCreacion: '2022-01-15', ultimaRevision: haceDias(45), privilegiosAdministrativos: false, tipoCuenta: 'Individual', estado: 'Activo' },
  { id: 'ac4', usuario: 'soporte.externo', area: 'Proveedor', equipoSistema: 'Servidor principal (escritorio remoto)', tipoAcceso: 'Acceso remoto', autorizadoPor: 'Gerente General', fechaCreacion: '2020-04-01', ultimaRevision: haceDias(210), privilegiosAdministrativos: true, tipoCuenta: 'Compartida', estado: 'Pendiente de revisión' },
  { id: 'ac5', usuario: 'recepcion', area: 'Administración', equipoSistema: 'Equipo de Recepción', tipoAcceso: 'Usuario estándar', autorizadoPor: 'Contador General', fechaCreacion: '2023-04-05', ultimaRevision: haceDias(15), privilegiosAdministrativos: false, tipoCuenta: 'Individual', estado: 'Activo' },
];

const respaldos: Respaldo[] = [
  { id: 'rs1', sistemaEquipo: 'Servidor principal', responsable: 'Gerente General', automatico: true, frecuencia: 'Diaria', medio: 'HDD externo', ubicacion: 'Oficina de Dirección', ultimoRespaldo: haceDias(1), ultimaPruebaRestauracion: '', resultadoRestauracion: 'No realizada', estado: 'Correcto', observaciones: 'Respaldo automático configurado; falta comprobar recuperación.' },
  { id: 'rs2', sistemaEquipo: 'Contabilidad', responsable: 'Gerente General', automatico: true, frecuencia: 'Sincronización automática', medio: 'HDD externo', ubicacion: 'Oficina de Contabilidad', ultimoRespaldo: haceDias(3), ultimaPruebaRestauracion: '', resultadoRestauracion: 'No realizada', estado: 'Pendiente de validar', observaciones: 'Validar integridad de la base de datos contable.' },
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

function riesgo(r: Omit<Riesgo, 'puntuacion' | 'nivel'>): Riesgo {
  const puntuacion = calcularPuntuacion(r.probabilidad, r.impacto);
  return { ...r, puntuacion, nivel: calcularNivel(puntuacion) };
}

const riesgos: Riesgo[] = [
  riesgo({ id: 'rg1', codigo: 'R1', tipo: 'Riesgo', nombre: 'Malware, ransomware u otro software malicioso', descripcion: 'Infección que cifre o dañe la información contable.', area: 'Contabilidad', probabilidad: 70, impacto: 5, evidencia: 'Protección antimalware pendiente de comprobar en algunos equipos.', recomendacion: 'Verificar antivirus activo y actualizado en todos los equipos.', responsable: 'Gerente General', fechaCompromiso: haceDias(-30), estado: 'Abierto' }),
  riesgo({ id: 'rg2', codigo: 'R2', tipo: 'Riesgo', nombre: 'Errores humanos, phishing o contraseñas inseguras', descripcion: 'Usuarios que caen en engaños o usan contraseñas débiles.', area: 'Usuarios', probabilidad: 80, impacto: 4, evidencia: 'Las contraseñas no se renuevan periódicamente.', recomendacion: 'Establecer política de contraseñas y capacitación.', responsable: 'Gerente General', fechaCompromiso: haceDias(-45), estado: 'Abierto' }),
  riesgo({ id: 'rg3', codigo: 'R3', tipo: 'Riesgo', nombre: 'Interrupciones administrativas por equipos obsoletos', descripcion: 'Equipos con lentitud, fallas o sin soporte.', area: 'Infraestructura', probabilidad: 80, impacto: 4, evidencia: 'Equipos con lentitud y sistemas operativos sin soporte identificados en Lansweeper.', recomendacion: 'Plan de renovación de equipos.', responsable: 'Gerente General', fechaCompromiso: haceDias(-60), estado: 'En proceso' }),
  riesgo({ id: 'rg6', codigo: 'R6', tipo: 'Riesgo', nombre: 'Respaldo que no pueda recuperarse cuando sea necesario', descripcion: 'Los respaldos automáticos no han sido probados.', area: 'Contabilidad', probabilidad: 60, impacto: 5, evidencia: 'No existe registro de pruebas de restauración.', recomendacion: 'Realizar prueba de restauración trimestral.', responsable: 'Gerente General', fechaCompromiso: haceDias(-15), estado: 'Abierto' }),
  riesgo({ id: 'rg8', codigo: 'R8', tipo: 'Riesgo', nombre: 'Accesos o permisos inadecuados', descripcion: 'Cuentas compartidas o con privilegios excesivos.', area: 'Usuarios', probabilidad: 60, impacto: 4, evidencia: 'Administración de accesos poco formal.', recomendacion: 'Revisión trimestral de accesos y cuentas individuales.', responsable: 'Gerente General', fechaCompromiso: haceDias(-30), estado: 'Abierto' }),
  riesgo({ id: 'hl1', codigo: 'H1', tipo: 'Hallazgo', nombre: 'Falta de inventario tecnológico completo', descripcion: 'No existe un registro centralizado de equipos y software.', area: 'Infraestructura', probabilidad: 100, impacto: 3, evidencia: 'Se implementa Lansweeper para descubrimiento e inventario de activos.', recomendacion: 'Mantener el inventario actualizado mediante Lansweeper.', responsable: 'Gerente General', fechaCompromiso: haceDias(-10), estado: 'En proceso' }),
  riesgo({ id: 'hl2', codigo: 'H2', tipo: 'Hallazgo', nombre: 'Dependencia de proveedores tecnológicos externos', descripcion: 'Servicios críticos dependen de terceros sin contratos vigentes.', area: 'Dirección', probabilidad: 70, impacto: 3, evidencia: 'Contrato de control volumétrico no localizado.', recomendacion: 'Formalizar contratos y tiempos de respuesta.', responsable: 'Gerente General', fechaCompromiso: haceDias(-40), estado: 'Abierto' }),
];

/** Carga los datos demo solo si nunca se han inicializado. */
export function initDemoData(force = false): void {
  // Limpia la clave del antiguo módulo Equipos (ahora el inventario está en Lansweeper)
  localStorage.removeItem('femal_equipos');
  if (!force && localStorage.getItem(KEYS.initialized)) return;
  writeList(KEYS.accesos, accesos);
  writeList(KEYS.respaldos, respaldos);
  writeList(KEYS.proveedores, proveedores);
  writeList(KEYS.riesgos, riesgos);
  localStorage.setItem(KEYS.initialized, new Date().toISOString());
}
