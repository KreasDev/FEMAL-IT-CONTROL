import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import CrudPage, { type Column, type Field } from '../components/CrudPage';
import StatusChip from '../components/StatusChip';
import { KEYS } from '../services/storage';
import { diasDesde, formatFecha } from '../services/rules';
import type { Acceso } from '../types';

const ESTADOS = ['Activo', 'Pendiente de revisión', 'Revocado'];

const fields: Field<Acceso>[] = [
  { key: 'usuario', label: 'Usuario / cuenta', required: true },
  { key: 'area', label: 'Área', required: true },
  { key: 'equipoSistema', label: 'Equipo o sistema', required: true },
  { key: 'tipoAcceso', label: 'Tipo de acceso', helperText: 'Ej. usuario estándar, administrador, acceso remoto' },
  { key: 'autorizadoPor', label: 'Autorizado por', required: true },
  { key: 'tipoCuenta', label: 'Tipo de cuenta', type: 'select', options: ['Individual', 'Compartida'] },
  { key: 'fechaCreacion', label: 'Fecha de creación', type: 'date' },
  { key: 'ultimaRevision', label: 'Última revisión', type: 'date', helperText: 'Se genera alerta si supera 90 días' },
  { key: 'estado', label: 'Estado', type: 'select', options: ESTADOS, required: true },
  { key: 'privilegiosAdministrativos', label: 'Privilegios administrativos', type: 'switch' },
];

const columns: Column<Acceso>[] = [
  { label: 'Usuario', render: (a) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.usuario}</Typography> },
  { label: 'Área', render: (a) => a.area },
  { label: 'Equipo / sistema', render: (a) => a.equipoSistema },
  { label: 'Tipo de acceso', render: (a) => a.tipoAcceso },
  { label: 'Autorizado por', render: (a) => a.autorizadoPor },
  { label: 'Cuenta', render: (a) => <StatusChip value={a.tipoCuenta} variant="outlined" /> },
  { label: 'Admin', render: (a) => (a.privilegiosAdministrativos ? <Chip size="small" label="Sí" color="error" variant="outlined" /> : <Chip size="small" label="No" variant="outlined" />) },
  {
    label: 'Última revisión',
    render: (a) => {
      const dias = diasDesde(a.ultimaRevision);
      const vencida = a.estado !== 'Revocado' && dias > 90;
      return (
        <>
          <Typography variant="body2" color={vencida ? 'error' : 'inherit'} sx={{ fontWeight: vencida ? 600 : 400 }}>
            {formatFecha(a.ultimaRevision)}
          </Typography>
          {vencida && (
            <Typography variant="caption" color="error">
              {dias === Infinity ? 'Nunca revisado' : `Hace ${dias} días`}
            </Typography>
          )}
        </>
      );
    },
  },
  { label: 'Estado', render: (a) => <StatusChip value={a.estado} /> },
];

export default function Accesos() {
  return (
    <CrudPage<Acceso>
      title="Control de accesos"
      subtitle="Usuarios, permisos y revisiones periódicas de acceso a equipos y sistemas"
      icon={<VpnKeyOutlinedIcon />}
      storageKey={KEYS.accesos}
      singular="Acceso"
      fields={fields}
      columns={columns}
      searchKeys={['usuario', 'area', 'equipoSistema', 'tipoAcceso', 'autorizadoPor']}
      statusKey="estado"
      statusOptions={ESTADOS}
      rowLabel={(a) => `${a.usuario} · ${a.equipoSistema}`}
      notice={
        <Alert severity="info" sx={{ mb: 2 }}>
          Por seguridad, este módulo <strong>no almacena contraseñas</strong>. Solo registra quién tiene acceso, quién lo autorizó y cuándo se revisó por última vez.
        </Alert>
      }
      emptyItem={() => ({
        usuario: '', area: '', equipoSistema: '', tipoAcceso: 'Usuario estándar', autorizadoPor: 'Gerente General',
        fechaCreacion: new Date().toISOString().slice(0, 10), ultimaRevision: new Date().toISOString().slice(0, 10),
        privilegiosAdministrativos: false, tipoCuenta: 'Individual', estado: 'Activo',
      })}
    />
  );
}
