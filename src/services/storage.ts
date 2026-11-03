import { useCallback, useEffect, useState } from 'react';

// Claves de localStorage por módulo
export const KEYS = {
  accesos: 'femal_accesos',
  respaldos: 'femal_respaldos',
  proveedores: 'femal_proveedores',
  initialized: 'femal_initialized',
} as const;

const CHANGE_EVENT = 'femal-storage-change';

export function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function writeList<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
  // Avisa a los demás componentes (header, dashboard) que los datos cambiaron
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: key }));
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Hook genérico: lista persistida en localStorage con operaciones CRUD. */
export function useCollection<T extends { id: string }>(key: string) {
  const [items, setItems] = useState<T[]>(() => readList<T>(key));

  useEffect(() => {
    const sync = () => setItems(readList<T>(key));
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [key]);

  const save = useCallback(
    (item: T) => {
      const list = readList<T>(key);
      const exists = list.some((i) => i.id === item.id);
      writeList(key, exists ? list.map((i) => (i.id === item.id ? item : i)) : [...list, item]);
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => writeList(key, readList<T>(key).filter((i) => i.id !== id)),
    [key],
  );

  return { items, save, remove };
}
