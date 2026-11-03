import { useMemo } from 'react';
import type { Acceso, Proveedor, Respaldo, Riesgo } from '../types';
import { KEYS, useCollection } from './storage';
import { generarAlertas } from './rules';

/** Lee todos los módulos y genera alertas. Se actualiza solo cuando cambia cualquier dato. */
export function useDashboardData() {
  const accesos = useCollection<Acceso>(KEYS.accesos).items;
  const respaldos = useCollection<Respaldo>(KEYS.respaldos).items;
  const proveedores = useCollection<Proveedor>(KEYS.proveedores).items;
  const riesgos = useCollection<Riesgo>(KEYS.riesgos).items;

  const alertas = useMemo(
    () => generarAlertas(accesos, respaldos, proveedores, riesgos),
    [accesos, respaldos, proveedores, riesgos],
  );

  return { accesos, respaldos, proveedores, riesgos, alertas };
}
