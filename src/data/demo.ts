import type { Acceso, Equipo, Proveedor, Respaldo, Riesgo } from '../types';
import { KEYS, writeList } from '../services/storage';
import { calcularNivel, calcularPuntuacion, haceDias } from '../services/rules';

// Las fechas son relativas a hoy para que las alertas siempre tengan sentido en la demo.

const equipos: Equipo[] = [
  { id: 'eq1', nombre: 'SRV-FEMAL-01', area: 'Infraestructura', usuarioResponsable: 'Gerente General', tipo: 'Servidor', marca: 'Dell', modelo: 'PowerEdge T340', procesador: 'Intel Xeon E-2224', ram: '32 GB', almacenamiento: '2 TB RAID 1', sistemaOperativo: 'Windows Server 2019', fechaAdquisicion: '2020-03-15', antivirus: 'ESET Server Security', ultimaRevision: haceDias(25), estado: 'Operativo', observaciones: 'Servidor principal de archivos y sistema contable.' },
  { id: 'eq2', nombre: 'CONT-PC-01', area: 'Contabilidad', usuarioResponsable: 'Contador General', tipo: 'Escritorio', marca: 'HP', modelo: 'ProDesk 400 G7', procesador: 'Intel Core i5-10500', ram: '16 GB', almacenamiento: '512 GB SSD', sistemaOperativo: 'Windows 11 Pro', fechaAdquisicion: '2021-06-10', antivirus: 'ESET Endpoint Security', ultimaRevision: haceDias(40), estado: 'Operativo', observaciones: '' },
  { id: 'eq3', nombre: 'CONT-PC-02', area: 'Contabilidad', usuarioResponsable: 'Auxiliar Contable', tipo: 'Escritorio', marca: 'Lenovo', modelo: 'ThinkCentre M70s', procesador: 'Intel Core i3-10100', ram: '8 GB', almacenamiento: '1 TB HDD', sistemaOperativo: 'Windows 10 Pro', fechaAdquisicion: '2019-02-20', antivirus: 'Pendiente de comprobar', ultimaRevision: haceDias(130), estado: 'Requiere revisión', observaciones: 'Usuario reporta lentitud al abrir el sistema contable.' },
  { id: 'eq4', nombre: 'CONT-LAP-01', area: 'Contabilidad', usuarioResponsable: 'Auxiliar de Facturación', tipo: 'Laptop', marca: 'Dell', modelo: 'Latitude 3420', procesador: 'Intel Core i5-1135G7', ram: '16 GB', almacenamiento: '256 GB SSD', sistemaOperativo: 'Windows 11 Pro', fechaAdquisicion: '2022-01-12', antivirus: 'ESET Endpoint Security', ultimaRevision: haceDias(60), estado: 'Operativo', observaciones: '' },
  { id: 'eq5', nombre: 'ADM-MAC-01', area: 'Dirección', usuarioResponsable: 'Gerente General', tipo: 'Laptop', marca: 'Apple', modelo: 'MacBook Air M1', procesador: 'Apple M1', ram: '8 GB', almacenamiento: '256 GB SSD', sistemaOperativo: 'macOS Sonoma', fechaAdquisicion: '2021-09-05', antivirus: 'XProtect (nativo)', ultimaRevision: haceDias(35), estado: 'Operativo', observaciones: '' },
  { id: 'eq6', nombre: 'ADM-PC-01', area: 'Administración', usuarioResponsable: 'Asistente Administrativo', tipo: 'Escritorio', marca: 'HP', modelo: 'Compaq 8200 Elite', procesador: 'Intel Core i3-2120', ram: '4 GB', almacenamiento: '500 GB HDD', sistemaOperativo: 'Windows 7 Professional', fechaAdquisicion: '2012-08-18', antivirus: 'Sin soporte', ultimaRevision: haceDias(200), estado: 'Obsoleto', observaciones: 'Sistema operativo sin soporte. Fallas frecuentes.' },
  { id: 'eq7', nombre: 'ADM-PC-02', area: 'Administración', usuarioResponsable: 'Recepción', tipo: 'Escritorio', marca: 'Lenovo', modelo: 'IdeaCentre 3', procesador: 'AMD Ryzen 5 5600G', ram: '8 GB', almacenamiento: '512 GB SSD', sistemaOperativo: 'Windows 11 Home', fechaAdquisicion: '2023-04-02', antivirus: 'Microsoft Defender', ultimaRevision: haceDias(20), estado: 'Operativo', observaciones: '' },
];

const accesos: Acceso[] = [
  { id: 'ac1', usuario: 'admin.servidor', area: 'Infraestructura', equipoSistema: 'SRV-FEMAL-01', tipoAcceso: 'Administrador local', autorizadoPor: 'Gerente General', fechaCreacion: '2020-03-20', ultimaRevision: haceDias(30), privilegiosAdministrativos: true, tipoCuenta: 'Individual', estado: 'Activo' },
  { id: 'ac2', usuario: 'contabilidad', area: 'Contabilidad', equipoSistema: 'Sistema contable', tipoAcceso: 'Usuario de aplicación', autorizadoPor: 'Gerente General', fechaCreacion: '2021-06-15', ultimaRevision: haceDias(150), privilegiosAdministrativos: false, tipoCuenta: 'Compartida', estado: 'Pendiente de revisión' },
  { id: 'ac3', usuario: 'jlopez', area: 'Contabilidad', equipoSistema: 'Portal de facturación electrónica', tipoAcceso: 'Emisor de CFDI', autorizadoPor: 'Gerente General', fechaCreacion: '2022-01-15', ultimaRevision: haceDias(45), privilegiosAdministrativos: false, tipoCuenta: 'Individual', estado: 'Activo' },
  { id: 'ac4', usuario: 'soporte.externo', area: 'Proveedor', equipoSistema: 'SRV-FEMAL-01 (escritorio remoto)', tipoAcceso: 'Acceso remoto', autorizadoPor: 'Gerente General', fechaCreacion: '2020-04-01', ultimaRevision: haceDias(210), privilegiosAdministrativos: true, tipoCuenta: 'Compartida', estado: 'Pendiente de revisión' },
  { id: 'ac5', usuario: 'recepcion', area: 'Administración', equipoSistema: 'ADM-PC-02', tipoAcceso: 'Usuario estándar', autorizadoPor: 'Contador General', fechaCreacion: '2023-04-05', ultimaRevision: haceDias(15), privilegiosAdministrativos: false, tipoCuenta: 'Individual', estado: 'Activo' },
];

const respaldos: Respaldo[] = [
  { id: 'rs1', sistemaEquipo: 'Servidor principal', responsable: 'Gerente General', automatico: true, frecuencia: 'Diaria', medio: 'HDD externo', ubicacion: 'Oficina de Dirección', ultimoRespaldo: haceDias(1), ultimaPruebaRestauracion: '', resultadoRestauracion: 'No realizada', estado: 'Correcto', observaciones: 'Respaldo automático configurado; falta comprobar recuperación.' },
  { id: 'rs2', sistemaEquipo: 'Contabilidad', responsable: 'Gerente General', automatico: true, frecuencia: 'Sincronización automática', medio: 'HDD externo', ubicacion: 'Oficina de Contabilidad', ultimoRespaldo: haceDias(3), ultimaPruebaRestauracion: '', resultadoRestauracion: 'No realizada', estado: 'Pendiente de validar', observaciones: 'Validar integridad de la base de datos contable.' },
];

const hoy = new Date().getFullYear();
const proveedores: Proveedor[] = [
  { id: 'pv1', proveedor: 'TecnoSoporte del Bajío', servicio: 'Soporte técnico', responsableInterno: 'Gerente General', contacto: 'soporte@tecnosoporte.mx · 477 123 4567', contratoDisponible: true, fechaInicio: `${hoy - 1}-01-01`, fechaVencimiento: `${hoy}-12-31`, tiempoRespuesta: '24 horas', accesoRemoto: true, estado: 'Activo', observaciones: 'Cuenta con acceso remoto al servidor.',
    incidencias: [
      { id: 'in1', fecha: haceDias(20), problema: 'Lentitud en CONT-PC-02', estado: 'En proceso', fechaSolucion: '' },
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
  riesgo({ id: 'rg3', codigo: 'R3', tipo: 'Riesgo', nombre: 'Interrupciones administrativas por equipos obsoletos', descripcion: 'Equipos con lentitud, fallas o sin soporte.', area: 'Infraestructura', probabilidad: 80, impacto: 4, evidencia: 'Equipo con Windows 7 en Administración.', recomendacion: 'Plan de renovación de equipos.', responsable: 'Gerente General', fechaCompromiso: haceDias(-60), estado: 'En proceso' }),
  riesgo({ id: 'rg6', codigo: 'R6', tipo: 'Riesgo', nombre: 'Respaldo que no pueda recuperarse cuando sea necesario', descripcion: 'Los respaldos automáticos no han sido probados.', area: 'Contabilidad', probabilidad: 60, impacto: 5, evidencia: 'No existe registro de pruebas de restauración.', recomendacion: 'Realizar prueba de restauración trimestral.', responsable: 'Gerente General', fechaCompromiso: haceDias(-15), estado: 'Abierto' }),
  riesgo({ id: 'rg8', codigo: 'R8', tipo: 'Riesgo', nombre: 'Accesos o permisos inadecuados', descripcion: 'Cuentas compartidas o con privilegios excesivos.', area: 'Usuarios', probabilidad: 60, impacto: 4, evidencia: 'Administración de accesos poco formal.', recomendacion: 'Revisión trimestral de accesos y cuentas individuales.', responsable: 'Gerente General', fechaCompromiso: haceDias(-30), estado: 'Abierto' }),
  riesgo({ id: 'hl1', codigo: 'H1', tipo: 'Hallazgo', nombre: 'Falta de inventario tecnológico completo', descripcion: 'No existe un registro centralizado de equipos y software.', area: 'Infraestructura', probabilidad: 100, impacto: 3, evidencia: 'Inventario levantado durante la auditoría.', recomendacion: 'Mantener actualizado el módulo de Equipos.', responsable: 'Gerente General', fechaCompromiso: haceDias(-10), estado: 'En proceso' }),
  riesgo({ id: 'hl2', codigo: 'H2', tipo: 'Hallazgo', nombre: 'Dependencia de proveedores tecnológicos externos', descripcion: 'Servicios críticos dependen de terceros sin contratos vigentes.', area: 'Dirección', probabilidad: 70, impacto: 3, evidencia: 'Contrato de control volumétrico no localizado.', recomendacion: 'Formalizar contratos y tiempos de respuesta.', responsable: 'Gerente General', fechaCompromiso: haceDias(-40), estado: 'Abierto' }),
];

/** Carga los datos demo solo si nunca se han inicializado. */
export function initDemoData(force = false): void {
  if (!force && localStorage.getItem(KEYS.initialized)) return;
  writeList(KEYS.equipos, equipos);
  writeList(KEYS.accesos, accesos);
  writeList(KEYS.respaldos, respaldos);
  writeList(KEYS.proveedores, proveedores);
  writeList(KEYS.riesgos, riesgos);
  localStorage.setItem(KEYS.initialized, new Date().toISOString());
}
