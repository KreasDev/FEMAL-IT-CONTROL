import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import CrudPage, { type Column, type Field } from '../components/CrudPage';
import StatusChip from '../components/StatusChip';
import { KEYS } from '../services/storage';
import { formatFecha } from '../services/rules';
import type { Respaldo } from '../types';

const ESTADOS = ['Correcto', 'Pendiente de validar', 'Fallido'];
const RESULTADOS = ['Exitosa', 'Fallida', 'No realizada'];

const fields: Field<Respaldo>[] = [
  { key: 'sistemaEquipo', label: 'Sistema / equipo', required: true },
  { key: 'responsable', label: 'Responsable', required: true },
  { key: 'frecuencia', label: 'Frecuencia', type: 'select', options: ['Diaria', 'Semanal', 'Mensual', 'Sincronización automática', 'Manual'] },
  { key: 'medio', label: 'Medio', type: 'select', options: ['HDD externo', 'NAS', 'Nube', 'USB', 'Cinta', 'Otro'] },
  { key: 'ubicacion', label: 'Ubicación del respaldo' },
  { key: 'automatico', label: 'Respaldo automático', type: 'switch' },
  { key: 'ultimoRespaldo', label: 'Último respaldo', type: 'date' },
  { key: 'ultimaPruebaRestauracion', label: 'Última prueba de restauración', type: 'date' },
  { key: 'resultadoRestauracion', label: 'Resultado de restauración', type: 'select', options: RESULTADOS, required: true },
  { key: 'estado', label: 'Estado', type: 'select', options: ESTADOS, required: true },
  { key: 'observaciones', label: 'Observaciones', type: 'multiline', width: 'full' },
];

const columns: Column<Respaldo>[] = [
  {
    label: 'Sistema / equipo',
    render: (r) => (
      <>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.sistemaEquipo}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {r.ubicacion}
        </Typography>
      </>
    ),
  },
  { label: 'Responsable', render: (r) => r.responsable },
  { label: 'Automático', render: (r) => <Chip size="small" variant="outlined" label={r.automatico ? 'Sí' : 'No'} color={r.automatico ? 'success' : 'default'} /> },
  { label: 'Frecuencia', render: (r) => r.frecuencia },
  { label: 'Medio', render: (r) => r.medio },
  { label: 'Último respaldo', render: (r) => formatFecha(r.ultimoRespaldo) },
  { label: 'Prueba de restauración', render: (r) => formatFecha(r.ultimaPruebaRestauracion) },
  { label: 'Resultado', render: (r) => <StatusChip value={r.resultadoRestauracion} variant="outlined" /> },
  { label: 'Estado', render: (r) => <StatusChip value={r.estado} /> },
];

export default function Respaldos() {
  return (
    <CrudPage<Respaldo>
      title="Respaldos de información"
      subtitle="Control de respaldos automáticos y comprobación de su recuperación"
      icon={<BackupOutlinedIcon />}
      storageKey={KEYS.respaldos}
      singular="Respaldo"
      fields={fields}
      columns={columns}
      searchKeys={['sistemaEquipo', 'responsable', 'medio', 'ubicacion', 'frecuencia']}
      statusKey="estado"
      statusOptions={ESTADOS}
      rowLabel={(r) => r.sistemaEquipo}
      emptyItem={() => ({
        sistemaEquipo: '', responsable: 'Gerente General', automatico: true, frecuencia: 'Diaria', medio: 'HDD externo', ubicacion: '',
        ultimoRespaldo: new Date().toISOString().slice(0, 10), ultimaPruebaRestauracion: '', resultadoRestauracion: 'No realizada',
        estado: 'Pendiente de validar', observaciones: '',
      })}
    />
  );
}
