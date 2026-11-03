import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import CrudPage, { type Column, type Field } from '../components/CrudPage';
import StatusChip from '../components/StatusChip';
import { KEYS } from '../services/storage';
import { calcularNivel, calcularPuntuacion, diasDesde, formatFecha } from '../services/rules';
import type { Riesgo } from '../types';

const ESTADOS = ['Abierto', 'En proceso', 'Atendido', 'Aceptado'];

const fields: Field<Riesgo>[] = [
  { key: 'codigo', label: 'Código', required: true, width: 'third', helperText: 'Ej. R9, H3' },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Riesgo', 'Hallazgo'], width: 'third' },
  { key: 'area', label: 'Área', required: true, width: 'third' },
  { key: 'nombre', label: 'Nombre', required: true, width: 'full' },
  { key: 'descripcion', label: 'Descripción', type: 'multiline', width: 'full' },
  { key: 'probabilidad', label: 'Probabilidad (%)', type: 'number', min: 0, max: 100, width: 'third' },
  { key: 'impacto', label: 'Impacto (1-5)', type: 'select', options: ['1', '2', '3', '4', '5'], width: 'third' },
  { key: 'estado', label: 'Estado', type: 'select', options: ESTADOS, required: true, width: 'third' },
  { key: 'evidencia', label: 'Evidencia', type: 'multiline' },
  { key: 'recomendacion', label: 'Recomendación', type: 'multiline' },
  { key: 'responsable', label: 'Responsable' },
  { key: 'fechaCompromiso', label: 'Fecha compromiso', type: 'date' },
];

const columns: Column<Riesgo>[] = [
  { label: 'Código', render: (r) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.codigo}</Typography> },
  { label: 'Tipo', render: (r) => <StatusChip value={r.tipo} variant="outlined" /> },
  {
    label: 'Nombre',
    render: (r) => (
      <Box sx={{ minWidth: 220 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {r.recomendacion}
        </Typography>
      </Box>
    ),
  },
  { label: 'Área', render: (r) => r.area },
  { label: 'Prob.', render: (r) => `${r.probabilidad}%` },
  { label: 'Impacto', render: (r) => r.impacto },
  { label: 'Puntuación', render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.puntuacion.toFixed(2)}</Typography> },
  { label: 'Nivel', render: (r) => <StatusChip value={r.nivel} /> },
  { label: 'Responsable', render: (r) => r.responsable },
  {
    label: 'Compromiso',
    render: (r) => {
      const vencida = r.fechaCompromiso && diasDesde(r.fechaCompromiso) > 0 && (r.estado === 'Abierto' || r.estado === 'En proceso');
      return <Typography variant="body2" color={vencida ? 'error' : 'inherit'}>{formatFecha(r.fechaCompromiso)}</Typography>;
    },
  },
  { label: 'Estado', render: (r) => <StatusChip value={r.estado} variant="outlined" /> },
];

/** Asegura que impacto y probabilidad sean números y recalcula puntuación y nivel */
function calcular(r: Riesgo): Riesgo {
  const probabilidad = Number(r.probabilidad) || 0;
  const impacto = Number(r.impacto) || 1;
  const puntuacion = calcularPuntuacion(probabilidad, impacto);
  return { ...r, probabilidad, impacto, puntuacion, nivel: calcularNivel(puntuacion) };
}

export default function Riesgos() {
  return (
    <CrudPage<Riesgo>
      title="Riesgos y hallazgos"
      subtitle="Matriz de riesgos y hallazgos de auditoría con cálculo automático de nivel"
      icon={<ReportProblemOutlinedIcon />}
      storageKey={KEYS.riesgos}
      singular="Riesgo"
      fields={fields}
      columns={columns}
      searchKeys={['codigo', 'nombre', 'area', 'responsable', 'tipo', 'nivel']}
      statusKey="estado"
      statusOptions={ESTADOS}
      rowLabel={(r) => `${r.codigo} · ${r.nombre}`}
      beforeSave={calcular}
      notice={
        <Alert severity="info" sx={{ mb: 2 }}>
          Puntuación = probabilidad (decimal) × impacto. Clasificación: <strong>Crítico</strong> ≥ 3.5 · <strong>Alto</strong> ≥ 2.5 · <strong>Medio</strong> ≥ 1.5 · <strong>Bajo</strong> &lt; 1.5
        </Alert>
      }
      formExtra={(draft) => {
        const r = calcular(draft);
        return (
          <Alert severity={r.nivel === 'Crítico' ? 'error' : r.nivel === 'Alto' ? 'warning' : r.nivel === 'Medio' ? 'info' : 'success'} icon={false}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body2">
                Cálculo automático: {(r.probabilidad / 100).toFixed(2)} × {r.impacto} = <strong>{r.puntuacion.toFixed(2)}</strong>
              </Typography>
              <StatusChip value={r.nivel} />
            </Stack>
          </Alert>
        );
      }}
      emptyItem={() => ({
        codigo: '', tipo: 'Riesgo', nombre: '', descripcion: '', area: '', probabilidad: 50, impacto: 3, puntuacion: 1.5, nivel: 'Medio',
        evidencia: '', recomendacion: '', responsable: 'Gerente General', fechaCompromiso: '', estado: 'Abierto',
      })}
    />
  );
}
