import type { Acceso, EstadoAuditoria, Proveedor, Respaldo } from '../types';

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

/**
 * Estado de auditoría de un respaldo:
 * - No conforme: no se ejecutó o la restauración falló.
 * - Conforme: se ejecutó y hay evidencia (una restauración no probada no lo vuelve no conforme).
 * - Pendiente de verificar: falta evidencia o nunca se ha revisado.
 */
export function calcularEstadoAuditoria(r: Respaldo): EstadoAuditoria {
  if (!r.respaldoEjecutado || r.resultadoRestauracion === 'Fallida') return 'No conforme';
  if (r.evidenciaDisponible && r.fechaRevision) return 'Conforme';
  return 'Pendiente de verificar';
}

/** Respaldos que requieren comprobación: no conformes, por verificar o sin prueba de restauración exitosa */
export const respaldoPendiente = (r: Respaldo) =>
  r.estadoAuditoria !== 'Conforme' || r.resultadoRestauracion !== 'Exitosa';

export type Severidad = 'error' | 'warning' | 'info';

export interface Alerta {
  id: string;
  severidad: Severidad;
  modulo: 'Accesos' | 'Respaldos' | 'Proveedores';
  titulo: string;
  detalle: string;
  ruta: string;
}

/** Genera alertas automáticamente a partir de los datos almacenados. */
export function generarAlertas(
  accesos: Acceso[],
  respaldos: Respaldo[],
  proveedores: Proveedor[],
): Alerta[] {
  const alertas: Alerta[] = [];
  const add = (a: Alerta) => alertas.push(a);

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
    const base = { modulo: 'Respaldos' as const, ruta: '/respaldos' };
    if (!r.respaldoEjecutado)
      add({ ...base, id: `rs-ne-${r.id}`, severidad: 'error', titulo: 'Respaldo no ejecutado', detalle: `${r.sistema}: ${r.herramienta} no registró la ejecución esperada.` });
    if (r.resultadoRestauracion === 'Fallida')
      add({ ...base, id: `rs-rf-${r.id}`, severidad: 'error', titulo: 'Restauración fallida', detalle: `${r.sistema}: la prueba de restauración no fue exitosa.` });
    if (r.estadoAuditoria === 'No conforme')
      add({ ...base, id: `rs-nc-${r.id}`, severidad: 'error', titulo: 'Respaldo no conforme', detalle: `${r.sistema}: el control de respaldo no se está cumpliendo.` });
    if (!r.evidenciaDisponible)
      add({ ...base, id: `rs-ev-${r.id}`, severidad: 'warning', titulo: 'Sin evidencia de respaldo', detalle: `${r.sistema}: no hay evidencia que compruebe la ejecución.` });
    if (r.resultadoRestauracion === 'No realizada')
      add({ ...base, id: `rs-nr-${r.id}`, severidad: 'info', titulo: 'Pendiente de prueba de restauración', detalle: `${r.sistema}: aún no se ha comprobado que el respaldo pueda recuperarse.` });
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

  const orden: Record<Severidad, number> = { error: 0, warning: 1, info: 2 };
  return alertas.sort((a, b) => orden[a.severidad] - orden[b.severidad]);
}
