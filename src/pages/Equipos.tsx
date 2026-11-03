import Typography from '@mui/material/Typography';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import CrudPage, { type Column, type Field } from '../components/CrudPage';
import StatusChip from '../components/StatusChip';
import { KEYS } from '../services/storage';
import { antivirusPendiente, diasDesde, formatFecha } from '../services/rules';
import type { Equipo } from '../types';

const ESTADOS = ['Operativo', 'Requiere revisión', 'Mantenimiento', 'Obsoleto'];
const AREAS = ['Dirección', 'Contabilidad', 'Administración', 'Infraestructura', 'Ventas', 'Operaciones'];

const fields: Field<Equipo>[] = [
  { key: 'nombre', label: 'Nombre del equipo', required: true },
  { key: 'area', label: 'Área', type: 'select', options: AREAS, required: true },
  { key: 'usuarioResponsable', label: 'Usuario responsable', required: true },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Servidor', 'Escritorio', 'Laptop', 'Impresora', 'Red', 'Otro'] },
  { key: 'marca', label: 'Marca', width: 'third' },
  { key: 'modelo', label: 'Modelo', width: 'third' },
  { key: 'procesador', label: 'Procesador', width: 'third' },
  { key: 'ram', label: 'RAM', width: 'third' },
  { key: 'almacenamiento', label: 'Almacenamiento', width: 'third' },
  { key: 'sistemaOperativo', label: 'Sistema operativo', width: 'third' },
  { key: 'antivirus', label: 'Antivirus', helperText: 'Escribe "Pendiente de comprobar" si no se ha verificado' },
  { key: 'estado', label: 'Estado', type: 'select', options: ESTADOS, required: true },
  { key: 'fechaAdquisicion', label: 'Fecha de adquisición', type: 'date' },
  { key: 'ultimaRevision', label: 'Última revisión', type: 'date' },
  { key: 'observaciones', label: 'Observaciones', type: 'multiline', width: 'full' },
];

const columns: Column<Equipo>[] = [
  {
    label: 'Equipo',
    render: (e) => (
      <>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {e.nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {e.tipo} · {e.marca} {e.modelo}
        </Typography>
      </>
    ),
  },
  { label: 'Área', render: (e) => e.area },
  { label: 'Responsable', render: (e) => e.usuarioResponsable },
  {
    label: 'Especificaciones',
    render: (e) => (
      <Typography variant="caption" sx={{ display: 'block', minWidth: 160 }}>
        {e.procesador}
        <br />
        {e.ram} · {e.almacenamiento}
      </Typography>
    ),
  },
  { label: 'Sistema operativo', render: (e) => e.sistemaOperativo },
  {
    label: 'Antivirus',
    render: (e) => <Typography variant="body2" color={antivirusPendiente(e.antivirus) ? 'error' : 'inherit'}>{e.antivirus || 'No registrado'}</Typography>,
  },
  {
    label: 'Última revisión',
    render: (e) => <Typography variant="body2" color={diasDesde(e.ultimaRevision) > 90 ? 'warning.main' : 'inherit'}>{formatFecha(e.ultimaRevision)}</Typography>,
  },
  { label: 'Estado', render: (e) => <StatusChip value={e.estado} /> },
];

export default function Equipos() {
  return (
    <CrudPage<Equipo>
      title="Inventario de equipos"
      subtitle="Registro tecnológico de equipos, especificaciones y estado de operación"
      icon={<ComputerOutlinedIcon />}
      storageKey={KEYS.equipos}
      singular="Equipo"
      fields={fields}
      columns={columns}
      searchKeys={['nombre', 'area', 'usuarioResponsable', 'marca', 'modelo', 'sistemaOperativo', 'tipo']}
      statusKey="estado"
      statusOptions={ESTADOS}
      rowLabel={(e) => e.nombre}
      emptyItem={() => ({
        nombre: '', area: '', usuarioResponsable: '', tipo: 'Escritorio', marca: '', modelo: '', procesador: '', ram: '', almacenamiento: '',
        sistemaOperativo: '', fechaAdquisicion: '', antivirus: '', ultimaRevision: new Date().toISOString().slice(0, 10), estado: 'Operativo', observaciones: '',
      })}
    />
  );
}
