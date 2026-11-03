import type { Acceso, Equipo, NivelRiesgo, Proveedor, Respaldo, Riesgo } from '../types';

/** puntuación = (probabilidad / 100) × impacto */
export function calcularPuntuacion(probabilidad: number, impacto: number): number {
  return Math.round((probabilidad / 100) * impacto * 100) / 100;
}

export function calcularNivel(puntuacion: number): NivelRiesgo {
  if (puntuacion >= 3.5) return 'Crítico';
  if (puntuacion >= 2.5) return 'Alto';
  if (puntuacion >= 1.5) return 'Medio';
  return 'Bajo';
}

/** Días transcurridos desde una fecha ISO (yyyy-mm-dd). Negativo si es futura. */
export function diasDesde(fecha: string): number {
  if (!fecha) return Infinity;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const ms = hoy.getTime() - new Date(fecha + 'T00:00:00').getTime();
  return Math.floor(ms / 86400000);
}

/** Fecha ISO de hace N días (N negativo = futuro). Útil para datos demo. */
export function haceDias(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function formatFecha(fecha: string): string {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

export const accesoRequiereRevision = (a: Acceso) =>
  a.estado !== 'Revocado' && (a.estado === 'Pendiente de revisión' || diasDesde(a.ultimaRevision) > 90);

export const respaldoPendiente = (r: Respaldo) =>
  r.estado !== 'Correcto' || r.resultadoRestauracion !== 'Exitosa';

export const antivirusPendiente = (antivirus: string) => {
  const v = (antivirus || '').toLowerCase();
  return !v || v.includes('sin') || v.includes('pendiente') || v.includes('vencid');
};

export type Severidad = 'error' | 'warning' | 'info';

export interface Alerta {
  id: string;
  severidad: Severidad;
  modulo: 'Equipos' | 'Accesos' | 'Respaldos' | 'Proveedores' | 'Riesgos';
  titulo: string;
  detalle: string;
  ruta: string;
}

/** Genera alertas automáticamente a partir de los datos almacenados. */
export function generarAlertas(
  equipos: Equipo[],
  accesos: Acceso[],
  respaldos: Respaldo[],
  proveedores: Proveedor[],
  riesgos: Riesgo[],
): Alerta[] {
  const alertas: Alerta[] = [];
  const add = (a: Alerta) => alertas.push(a);

  equipos.forEach((e) => {
    if (e.estado === 'Obsoleto')
      add({ id: `eq-o-${e.id}`, severidad: 'error', modulo: 'Equipos', titulo: 'Equipo obsoleto', detalle: `${e.nombre} (${e.area}) debe planificarse para reemplazo.`, ruta: '/equipos' });
    if (e.estado === 'Requiere revisión')
      add({ id: `eq-r-${e.id}`, severidad: 'warning', modulo: 'Equipos', titulo: 'Equipo requiere revisión', detalle: `${e.nombre} (${e.area}) presenta lentitud o fallas.`, ruta: '/equipos' });
    if (e.estado !== 'Obsoleto' && antivirusPendiente(e.antivirus))
      add({ id: `eq-av-${e.id}`, severidad: 'warning', modulo: 'Equipos', titulo: 'Protección antimalware sin comprobar', detalle: `${e.nombre}: antivirus "${e.antivirus || 'no registrado'}".`, ruta: '/equipos' });
  });

  accesos.forEach((a) => {
    if (a.estado === 'Revocado') return;
    const dias = diasDesde(a.ultimaRevision);
    if (dias > 90)
      add({ id: `ac-90-${a.id}`, severidad: 'warning', modulo: 'Accesos', titulo: 'Acceso sin revisar por más de 90 días', detalle: `${a.usuario} en ${a.equipoSistema}: ${dias === Infinity ? 'nunca revisado' : `${dias} días sin revisión`}.`, ruta: '/accesos' });
    else if (a.estado === 'Pendiente de revisión')
      add({ id: `ac-p-${a.id}`, severidad: 'info', modulo: 'Accesos', titulo: 'Acceso pendiente de revisión', detalle: `${a.usuario} en ${a.equipoSistema}.`, ruta: '/accesos' });
    if (a.tipoCuenta === 'Compartida' && a.privilegiosAdministrativos)
      add({ id: `ac-c-${a.id}`, severidad: 'error', modulo: 'Accesos', titulo: 'Cuenta compartida con privilegios administrativos', detalle: `${a.usuario} en ${a.equipoSistema}.`, ruta: '/accesos' });
  });

  respaldos.forEach((r) => {
    if (r.estado === 'Fallido')
      add({ id: `rs-f-${r.id}`, severidad: 'error', modulo: 'Respaldos', titulo: 'Respaldo fallido', detalle: `${r.sistemaEquipo}: el último respaldo falló.`, ruta: '/respaldos' });
    if (r.resultadoRestauracion === 'Fallida')
      add({ id: `rs-rf-${r.id}`, severidad: 'error', modulo: 'Respaldos', titulo: 'Restauración fallida', detalle: `${r.sistemaEquipo}: la prueba de restauración no fue exitosa.`, ruta: '/respaldos' });
    if (r.resultadoRestauracion === 'No realizada')
      add({ id: `rs-nr-${r.id}`, severidad: 'warning', modulo: 'Respaldos', titulo: 'Respaldo sin prueba de restauración', detalle: `${r.sistemaEquipo}: nunca se ha comprobado que pueda recuperarse.`, ruta: '/respaldos' });
    if (r.estado === 'Pendiente de validar')
      add({ id: `rs-p-${r.id}`, severidad: 'warning', modulo: 'Respaldos', titulo: 'Respaldo pendiente de validar', detalle: `${r.sistemaEquipo}.`, ruta: '/respaldos' });
  });

  proveedores.forEach((p) => {
    const dias = p.fechaVencimiento ? diasDesde(p.fechaVencimiento) : -Infinity;
    if (p.estado === 'Vencido' || dias > 0)
      add({ id: `pv-v-${p.id}`, severidad: 'error', modulo: 'Proveedores', titulo: 'Contrato de proveedor vencido', detalle: `${p.proveedor} (${p.servicio}).`, ruta: '/proveedores' });
    else if (dias > -30)
      add({ id: `pv-pv-${p.id}`, severidad: 'warning', modulo: 'Proveedores', titulo: 'Contrato próximo a vencer', detalle: `${p.proveedor} vence el ${formatFecha(p.fechaVencimiento)}.`, ruta: '/proveedores' });
    if (!p.contratoDisponible)
      add({ id: `pv-c-${p.id}`, severidad: 'warning', modulo: 'Proveedores', titulo: 'Proveedor sin contrato disponible', detalle: `${p.proveedor} (${p.servicio}).`, ruta: '/proveedores' });
    const abiertas = (p.incidencias || []).filter((i) => i.estado !== 'Resuelta').length;
    if (abiertas > 0)
      add({ id: `pv-i-${p.id}`, severidad: 'info', modulo: 'Proveedores', titulo: 'Incidencias abiertas con proveedor', detalle: `${p.proveedor}: ${abiertas} incidencia(s) sin resolver.`, ruta: '/proveedores' });
  });

  riesgos.forEach((r) => {
    if (r.nivel === 'Crítico' && r.estado === 'Abierto')
      add({ id: `rg-c-${r.id}`, severidad: 'error', modulo: 'Riesgos', titulo: 'Riesgo crítico abierto', detalle: `${r.codigo} · ${r.nombre}`, ruta: '/riesgos' });
    if (r.fechaCompromiso && diasDesde(r.fechaCompromiso) > 0 && (r.estado === 'Abierto' || r.estado === 'En proceso'))
      add({ id: `rg-f-${r.id}`, severidad: 'warning', modulo: 'Riesgos', titulo: 'Fecha compromiso vencida', detalle: `${r.codigo} · ${r.nombre}`, ruta: '/riesgos' });
  });

  const orden: Record<Severidad, number> = { error: 0, warning: 1, info: 2 };
  return alertas.sort((a, b) => orden[a.severidad] - orden[b.severidad]);
}
