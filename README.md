# FEMAL IT Control

Sistema de seguimiento y auditoría de controles de TI creado a partir de la Auditoría Informática a FEMAL, S.A. de C.V.

## Arquitectura

| Componente | Función |
|---|---|
| **Lansweeper** | Inventario y descubrimiento de activos tecnológicos (hardware, software, red). |
| **Windows Server Backup** | Ejecución y programación de respaldos del servidor. |
| **FEMAL IT Control** | Verifica, documenta y da seguimiento a que los controles se cumplan. |

FEMAL IT Control no reemplaza herramientas especializadas: no hace inventario técnico ni ejecuta respaldos.
Sirve para comprobar controles, registrar evidencia, identificar incumplimientos, generar alertas,
asignar responsables y dar seguimiento a riesgos y hallazgos. No hay integración con las herramientas externas
(una integración automática queda como trabajo futuro).

## Módulos

- **Inicio**: ecosistema de control de TI, indicadores de cumplimiento y alertas automáticas.
- **Accesos**: usuarios, permisos y revisiones (alerta si pasan más de 90 días sin revisar). No guarda contraseñas.
- **Respaldos**: auditoría de evidencia de respaldos (Conforme / Pendiente de verificar / No conforme).
- **Proveedores**: contratos, tiempos de respuesta, accesos remotos e incidencias simples.
- **Riesgos y hallazgos**: matriz con puntuación (probabilidad × impacto) y nivel calculados.

## Ejecutar

```bash
npm install
npm run dev
```

Build de producción: `npm run build` (resultado en `dist/`).

Solo frontend (React + Vite + TypeScript + Material UI + React Router). Los datos se guardan en `localStorage`;
la primera vez se cargan datos demo (botón "Restablecer datos demo" en el menú lateral).
