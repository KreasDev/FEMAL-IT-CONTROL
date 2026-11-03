import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckIcon from '@mui/icons-material/Check';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useDashboardData } from '../services/useDashboardData';
import { accesoRequiereRevision, diasDesde, respaldoPendiente, type Severidad } from '../services/rules';
import type { Proveedor } from '../types';

interface KpiProps {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
  hint: string;
  to: string;
}

function Kpi({ label, value, icon, color, hint, to }: KpiProps) {
  const navigate = useNavigate();
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={() => navigate(to)} sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {label}
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.5, color }}>
                {value}
              </Typography>
            </Box>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: `${color}18`, color, flexShrink: 0 }}>{icon}</Box>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

interface ToolCardProps {
  icon: ReactNode;
  etiqueta: string;
  titulo: string;
  texto: string;
  descripcion: string;
}

/** Tarjeta informativa de una herramienta externa (sin integración) */
function ToolCard({ icon, etiqueta, titulo, texto, descripcion }: ToolCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {etiqueta}
            </Typography>
            <Typography variant="h6">{titulo}</Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: '#2a6fdb18', color: '#2a6fdb', flexShrink: 0 }}>{icon}</Box>
        </Stack>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {texto}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {descripcion}
        </Typography>
        <Chip size="small" variant="outlined" label="Herramienta externa · informativa" sx={{ mt: 1.5 }} />
      </CardContent>
    </Card>
  );
}

/** Contrato vencido, por vencer (30 días), en revisión o sin contrato disponible */
const contratoConProblema = (p: Proveedor) =>
  p.estado !== 'Activo' || !p.contratoDisponible || (!!p.fechaVencimiento && diasDesde(p.fechaVencimiento) > -30);

export default function Dashboard() {
  const { accesos, respaldos, proveedores, alertas } = useDashboardData();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Severidad | 'todas'>('todas');

  const vigentes = accesos.filter((a) => a.estado !== 'Revocado');
  const incidenciasAbiertas = proveedores.reduce((n, p) => n + (p.incidencias ?? []).filter((i) => i.estado !== 'Resuelta').length, 0);

  const kpis: KpiProps[] = [
    { label: 'Accesos pendientes de revisión', value: accesos.filter(accesoRequiereRevision).length, icon: <VpnKeyOutlinedIcon />, color: '#ed6c02', hint: 'Pendientes o > 90 días sin revisar', to: '/accesos' },
    { label: 'Accesos con privilegios administrativos', value: vigentes.filter((a) => a.privilegiosAdministrativos).length, icon: <AdminPanelSettingsOutlinedIcon />, color: '#0b2545', hint: 'Cuentas vigentes con permisos elevados', to: '/accesos' },
    { label: 'Respaldos pendientes de comprobar', value: respaldos.filter(respaldoPendiente).length, icon: <BackupOutlinedIcon />, color: '#ed6c02', hint: 'Sin evidencia, no conformes o sin prueba de restauración', to: '/respaldos' },
    { label: 'Respaldos no conformes', value: respaldos.filter((r) => r.estadoAuditoria === 'No conforme').length, icon: <GppBadOutlinedIcon />, color: '#d32f2f', hint: 'No ejecutados o con restauración fallida', to: '/respaldos' },
    { label: 'Proveedores activos', value: proveedores.filter((p) => p.estado === 'Activo').length, icon: <HandshakeOutlinedIcon />, color: '#2a6fdb', hint: `${proveedores.length} proveedores registrados`, to: '/proveedores' },
    { label: 'Proveedores con contrato vencido o pendiente', value: proveedores.filter(contratoConProblema).length, icon: <EventBusyOutlinedIcon />, color: '#d32f2f', hint: 'Vencidos, por vencer, en revisión o sin contrato', to: '/proveedores' },
    { label: 'Incidencias abiertas', value: incidenciasAbiertas, icon: <SupportAgentOutlinedIcon />, color: '#ed6c02', hint: 'Incidencias con proveedores sin resolver', to: '/proveedores' },
  ];

  const alertasVisibles = filtro === 'todas' ? alertas : alertas.filter((a) => a.severidad === filtro);
  const cuenta = (s: Severidad) => alertas.filter((a) => a.severidad === s).length;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Panel de control de TI</Typography>
        <Typography variant="body2" color="text.secondary">
          Seguimiento de los controles de TI derivados de la Auditoría Informática a FEMAL, S.A. de C.V.
        </Typography>
      </Box>

      {/* Ecosistema: herramientas externas + FEMAL IT Control */}
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
        Ecosistema de control de TI
      </Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, mb: 3, mt: 0.5 }}>
        <ToolCard
          icon={<LanOutlinedIcon />}
          etiqueta="Inventario tecnológico"
          titulo="Lansweeper"
          texto="Inventario y descubrimiento de activos"
          descripcion="El inventario de hardware, software y dispositivos de red se gestiona mediante Lansweeper."
        />
        <ToolCard
          icon={<SettingsBackupRestoreIcon />}
          etiqueta="Respaldos automáticos"
          titulo="Windows Server Backup"
          texto="Ejecución automática de respaldos"
          descripcion="Los respaldos del servidor son ejecutados mediante Windows Server Backup. FEMAL IT Control registra y verifica la evidencia de su ejecución."
        />
        <Card sx={{ bgcolor: 'primary.main', color: '#fff', border: 0 }}>
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.75, fontWeight: 600 }}>
                  Auditoría y seguimiento de controles
                </Typography>
                <Typography variant="h6">FEMAL IT Control</Typography>
              </Box>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.14)', flexShrink: 0 }}>
                <ShieldOutlinedIcon />
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 1 }}>
              No reemplaza herramientas especializadas. Sirve para:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 1, rowGap: 0.25 }}>
              {['Comprobar controles', 'Registrar evidencia', 'Detectar incumplimientos', 'Generar alertas', 'Asignar responsables', 'Dar seguimiento'].map((t) => (
                <Stack key={t} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <CheckIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                  <Typography variant="caption">{t}</Typography>
                </Stack>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
        Indicadores de cumplimiento
      </Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, mb: 3, mt: 0.5 }}>
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </Box>

      {/* Alertas */}
      <Card>
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6">Alertas ({alertas.length})</Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
              <Chip size="small" label="Todas" color={filtro === 'todas' ? 'primary' : 'default'} onClick={() => setFiltro('todas')} />
              <Chip size="small" label={`Críticas ${cuenta('error')}`} color={filtro === 'error' ? 'error' : 'default'} onClick={() => setFiltro('error')} />
              <Chip size="small" label={`Advertencias ${cuenta('warning')}`} color={filtro === 'warning' ? 'warning' : 'default'} onClick={() => setFiltro('warning')} />
              <Chip size="small" label={`Info ${cuenta('info')}`} color={filtro === 'info' ? 'info' : 'default'} onClick={() => setFiltro('info')} />
            </Stack>
          </Stack>
          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
            {alertasVisibles.map((a) => (
              <Alert key={a.id} severity={a.severidad} variant="outlined" onClick={() => navigate(a.ruta)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} action={<Chip size="small" label={a.modulo} variant="outlined" />}>
                <AlertTitle sx={{ mb: 0, fontSize: 14 }}>{a.titulo}</AlertTitle>
                <Typography variant="body2">{a.detalle}</Typography>
              </Alert>
            ))}
          </Box>
          {alertasVisibles.length === 0 && (
            <Stack sx={{ alignItems: 'center', py: 4, color: 'success.main' }}>
              <CheckCircleOutlineIcon fontSize="large" />
              <Typography variant="body2">Sin alertas en esta categoría</Typography>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
