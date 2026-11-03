import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CrudPage, { type Column, type Field } from '../components/CrudPage';
import StatusChip from '../components/StatusChip';
import { KEYS } from '../services/storage';
import { calcularEstadoAuditoria, formatFecha } from '../services/rules';
import type { Respaldo } from '../types';

const ESTADOS = ['Conforme', 'Pendiente de verificar', 'No conforme'];
const RESULTADOS = ['Exitosa', 'Fallida', 'No realizada'];
const TIPOS_EVIDENCIA = ['Registro de Windows Server Backup', 'Captura de pantalla', 'Log', 'Archivo de respaldo', 'Verificación manual', 'Otro'];

const fields: Field<Respaldo>[] = [
  { key: 'sistema', label: 'Sistema', required: true },
  { key: 'herramienta', label: 'Herramienta que ejecuta el respaldo', type: 'select', options: ['Windows Server Backup', 'Sincronización automática', 'Otro'], required: true },
  { key: 'responsable', label: 'Responsable', required: true },
  { key: 'frecuenciaEsperada', label: 'Frecuencia esperada', type: 'select', options: ['Diaria', 'Semanal', 'Mensual', 'Automática'], helperText: 'Solo para fines de auditoría' },
  { key: 'fechaProgramada', label: 'Fecha programada', type: 'date', width: 'third' },
  { key: 'fechaUltimoRespaldo', label: 'Fecha del último respaldo', type: 'date', width: 'third' },
  { key: 'respaldoEjecutado', label: 'Respaldo ejecutado', type: 'switch', width: 'third' },
  { key: 'evidenciaDisponible', label: 'Evidencia disponible', type: 'switch', width: 'third' },
  { key: 'tipoEvidencia', label: 'Tipo de evidencia', type: 'select', options: TIPOS_EVIDENCIA, width: 'third' },
  { key: 'ubicacionEvidencia', label: 'Ubicación de la evidencia', width: 'third' },
  { key: 'ultimaPruebaRestauracion', label: 'Última prueba de restauración', type: 'date' },
  { key: 'resultadoRestauracion', label: 'Resultado de restauración', type: 'select', options: RESULTADOS, required: true },
  { key: 'revisadoPor', label: 'Revisado por' },
  { key: 'fechaRevision', label: 'Fecha de revisión', type: 'date' },
  { key: 'observaciones', label: 'Observaciones', type: 'multiline', width: 'full' },
];

const siNo = (v: boolean, okColor: 'success' | 'warning' = 'success') => (
  <Chip size="small" variant="outlined" label={v ? 'Sí' : 'No'} color={v ? okColor : 'error'} />
);

const columns: Column<Respaldo>[] = [
  {
    label: 'Sistema',
    render: (r) => (
      <>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.sistema}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {r.herramienta} · {r.frecuenciaEsperada}
        </Typography>
      </>
    ),
  },
  { label: 'Responsable', render: (r) => r.responsable },
  { label: 'Último respaldo', render: (r) => formatFecha(r.fechaUltimoRespaldo) },
  { label: 'Ejecutado', render: (r) => siNo(r.respaldoEjecutado) },
  {
    label: 'Evidencia',
    render: (r) => (
      <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
        {siNo(r.evidenciaDisponible)}
        {r.evidenciaDisponible && r.tipoEvidencia && (
          <Typography variant="caption" color="text.secondary">
            {r.tipoEvidencia}
          </Typography>
        )}
      </Stack>
    ),
  },
  {
    label: 'Prueba de restauración',
    render: (r) => (
      <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
        <StatusChip value={r.resultadoRestauracion} variant="outlined" />
        <Typography variant="caption" color="text.secondary">
          {formatFecha(r.ultimaPruebaRestauracion)}
        </Typography>
      </Stack>
    ),
  },
  {
    label: 'Revisión',
    render: (r) => (
      <>
        <Typography variant="body2">{r.revisadoPor || '—'}</Typography>
        <Typography variant="caption" color="text.secondary">
          {formatFecha(r.fechaRevision)}
        </Typography>
      </>
    ),
  },
  { label: 'Estado de auditoría', render: (r) => <StatusChip value={r.estadoAuditoria} /> },
];

const conEstado = (r: Respaldo): Respaldo => ({ ...r, estadoAuditoria: calcularEstadoAuditoria(r) });

export default function Respaldos() {
  return (
    <CrudPage<Respaldo>
      title="Auditoría de respaldos"
      subtitle="Verificación y evidencia de que los respaldos realmente se ejecutaron"
      icon={<FactCheckOutlinedIcon />}
      storageKey={KEYS.respaldos}
      singular="Revisión"
      fields={fields}
      columns={columns}
      searchKeys={['sistema', 'herramienta', 'responsable', 'tipoEvidencia', 'revisadoPor']}
      statusKey="estadoAuditoria"
      statusOptions={ESTADOS}
      rowLabel={(r) => `${r.sistema} · ${r.herramienta}`}
      beforeSave={conEstado}
      notice={
        <Alert severity="info" sx={{ mb: 2 }}>
          Los respaldos los ejecuta <strong>Windows Server Backup</strong> u otra herramienta. FEMAL IT Control <strong>no ejecuta respaldos</strong>: registra la evidencia y verifica que el control se cumpla.
        </Alert>
      }
      formExtra={(draft) => {
        const estado = calcularEstadoAuditoria(draft);
        return (
          <Alert severity={estado === 'Conforme' ? 'success' : estado === 'No conforme' ? 'error' : 'warning'} icon={false}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body2">Estado de auditoría calculado automáticamente:</Typography>
              <StatusChip value={estado} />
            </Stack>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
              Conforme: ejecutado, con evidencia y revisado · No conforme: no ejecutado o restauración fallida · En otro caso: pendiente de verificar.
            </Typography>
          </Alert>
        );
      }}
      emptyItem={() => ({
        sistema: '', herramienta: 'Windows Server Backup', responsable: 'Gerente General', frecuenciaEsperada: 'Diaria',
        fechaProgramada: '', fechaUltimoRespaldo: '', respaldoEjecutado: true, evidenciaDisponible: false, tipoEvidencia: '',
        ubicacionEvidencia: '', ultimaPruebaRestauracion: '', resultadoRestauracion: 'No realizada', revisadoPor: '',
        fechaRevision: new Date().toISOString().slice(0, 10), estadoAuditoria: 'Pendiente de verificar', observaciones: '',
      })}
    />
  );
}
