import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StatusChip from '../components/StatusChip';
import { useDashboardData } from '../services/useDashboardData';
import { accesoRequiereRevision, respaldoPendiente, type Severidad } from '../services/rules';
import type { NivelRiesgo } from '../types';

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
            <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: `${color}18`, color }}>{icon}</Box>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

const NIVELES: { nivel: NivelRiesgo; color: string }[] = [
  { nivel: 'Crítico', color: '#d32f2f' },
  { nivel: 'Alto', color: '#ed6c02' },
  { nivel: 'Medio', color: '#0288d1' },
  { nivel: 'Bajo', color: '#2e7d32' },
];

export default function Dashboard() {
  const { equipos, accesos, respaldos, proveedores, riesgos, alertas } = useDashboardData();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Severidad | 'todas'>('todas');

  const abiertos = riesgos.filter((r) => r.estado === 'Abierto' || r.estado === 'En proceso');
  const kpis: KpiProps[] = [
    { label: 'Total de equipos', value: equipos.length, icon: <ComputerOutlinedIcon />, color: '#0b2545', hint: 'Inventario tecnológico registrado', to: '/equipos' },
    { label: 'Equipos que requieren revisión', value: equipos.filter((e) => e.estado !== 'Operativo').length, icon: <BuildCircleOutlinedIcon />, color: '#ed6c02', hint: 'Revisión, mantenimiento u obsoletos', to: '/equipos' },
    { label: 'Respaldos pendientes', value: respaldos.filter(respaldoPendiente).length, icon: <BackupOutlinedIcon />, color: '#ed6c02', hint: 'Sin validar o sin restauración exitosa', to: '/respaldos' },
    { label: 'Accesos pendientes de revisión', value: accesos.filter(accesoRequiereRevision).length, icon: <VpnKeyOutlinedIcon />, color: '#ed6c02', hint: 'Pendientes o > 90 días sin revisar', to: '/accesos' },
    { label: 'Proveedores activos', value: proveedores.filter((p) => p.estado === 'Activo').length, icon: <HandshakeOutlinedIcon />, color: '#2a6fdb', hint: `${proveedores.length} proveedores registrados`, to: '/proveedores' },
    { label: 'Riesgos críticos', value: abiertos.filter((r) => r.nivel === 'Crítico').length, icon: <GppBadOutlinedIcon />, color: '#d32f2f', hint: 'Abiertos o en proceso', to: '/riesgos' },
    { label: 'Riesgos altos', value: abiertos.filter((r) => r.nivel === 'Alto').length, icon: <WarningAmberOutlinedIcon />, color: '#ed6c02', hint: 'Abiertos o en proceso', to: '/riesgos' },
  ];

  const prioritarios = [...abiertos].sort((a, b) => b.puntuacion - a.puntuacion).slice(0, 8);
  const alertasVisibles = filtro === 'todas' ? alertas : alertas.filter((a) => a.severidad === filtro);
  const cuenta = (s: Severidad) => alertas.filter((a) => a.severidad === s).length;
  const atendidos = riesgos.filter((r) => r.estado === 'Atendido' || r.estado === 'Aceptado').length;
  const avance = riesgos.length ? Math.round((atendidos / riesgos.length) * 100) : 0;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Panel de control de TI</Typography>
        <Typography variant="body2" color="text.secondary">
          Seguimiento de los hallazgos de la Auditoría Informática a FEMAL, S.A. de C.V.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, mb: 3 }}>
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Avance de atención de riesgos
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5, color: '#2e7d32' }}>
              {avance}%
            </Typography>
            <LinearProgress variant="determinate" value={avance} color="success" sx={{ mt: 1, height: 8, borderRadius: 4 }} />
            <Typography variant="caption" color="text.secondary">
              {atendidos} de {riesgos.length} atendidos o aceptados
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' } }}>
        {/* Alertas */}
        <Card>
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6">Alertas ({alertas.length})</Typography>
              <Stack direction="row" spacing={0.5}>
                <Chip size="small" label="Todas" color={filtro === 'todas' ? 'primary' : 'default'} onClick={() => setFiltro('todas')} />
                <Chip size="small" label={`Críticas ${cuenta('error')}`} color={filtro === 'error' ? 'error' : 'default'} onClick={() => setFiltro('error')} />
                <Chip size="small" label={`Advertencias ${cuenta('warning')}`} color={filtro === 'warning' ? 'warning' : 'default'} onClick={() => setFiltro('warning')} />
                <Chip size="small" label={`Info ${cuenta('info')}`} color={filtro === 'info' ? 'info' : 'default'} onClick={() => setFiltro('info')} />
              </Stack>
            </Stack>
            <Stack spacing={1} sx={{ maxHeight: 520, overflowY: 'auto', pr: 0.5 }}>
              {alertasVisibles.map((a) => (
                <Alert key={a.id} severity={a.severidad} variant="outlined" onClick={() => navigate(a.ruta)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} action={<Chip size="small" label={a.modulo} variant="outlined" />}>
                  <AlertTitle sx={{ mb: 0, fontSize: 14 }}>{a.titulo}</AlertTitle>
                  <Typography variant="body2">{a.detalle}</Typography>
                </Alert>
              ))}
              {alertasVisibles.length === 0 && (
                <Stack sx={{ alignItems: 'center', py: 4, color: 'success.main' }}>
                  <CheckCircleOutlineIcon fontSize="large" />
                  <Typography variant="body2">Sin alertas en esta categoría</Typography>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={3}>
          {/* Riesgos prioritarios */}
          <Card>
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Riesgos prioritarios
              </Typography>
            </CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Riesgo</TableCell>
                    <TableCell>Área</TableCell>
                    <TableCell>Puntuación</TableCell>
                    <TableCell>Nivel</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prioritarios.map((r) => (
                    <TableRow key={r.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/riesgos')}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {r.codigo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>{r.area}</TableCell>
                      <TableCell>{r.puntuacion.toFixed(2)}</TableCell>
                      <TableCell>
                        <StatusChip value={r.nivel} />
                      </TableCell>
                      <TableCell>
                        <StatusChip value={r.estado} variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {prioritarios.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No hay riesgos abiertos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Distribución */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Distribución por nivel (riesgos abiertos)
              </Typography>
              <Stack spacing={1.5}>
                {NIVELES.map(({ nivel, color }) => {
                  const n = abiertos.filter((r) => r.nivel === nivel).length;
                  const pct = abiertos.length ? (n / abiertos.length) * 100 : 0;
                  return (
                    <Box key={nivel}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="body2">{nivel}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {n}
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4, bgcolor: '#eef1f6', '& .MuiLinearProgress-bar': { bgcolor: color } }} />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
