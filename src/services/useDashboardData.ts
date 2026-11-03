import { useMemo } from 'react';
import type { Acceso, Proveedor, Respaldo } from '../types';
import { KEYS, useCollection } from './storage';
import { generarAlertas } from './rules';

/** Lee todos los módulos y genera alertas. Se actualiza solo cuando cambia cualquier dato. */
export function useDashboardData() {
  const accesos = useCollection<Acceso>(KEYS.accesos).items;
  const respaldos = useCollection<Respaldo>(KEYS.respaldos).items;
  const proveedores = useCollection<Proveedor>(KEYS.proveedores).items;

  const alertas = useMemo(
    () => generarAlertas(accesos, respaldos, proveedores),
    [accesos, respaldos, proveedores],
  );

  return { accesos, respaldos, proveedores, alertas };
}
