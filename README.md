# FEMAL IT Control

Sistema de control y seguimiento de TI creado a partir de la Auditoría Informática a FEMAL, S.A. de C.V.

MVP solo frontend (React + Vite + TypeScript + Material UI + React Router). Los datos se guardan en `localStorage`;
la primera vez se cargan datos demo automáticamente (botón "Restablecer datos demo" en el menú lateral).

El inventario de hardware, software y dispositivos de red se administra con **Lansweeper** como herramienta externa
(sin integración).

## Ejecutar

```bash
npm install
npm run dev
```

Build de producción: `npm run build` (resultado en `dist/`).

## Módulos

- Inicio (dashboard con indicadores y alertas automáticas)
- Accesos
- Respaldos
- Proveedores (con incidencias)
- Riesgos y hallazgos (puntuación y nivel calculados)
