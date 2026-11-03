import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ConfirmDialog from './ConfirmDialog';
import { useDashboardData } from '../services/useDashboardData';
import { initDemoData } from '../data/demo';

const DRAWER_WIDTH = 260;

export const NAV: { to: string; label: string; icon: ReactNode }[] = [
  { to: '/', label: 'Inicio', icon: <DashboardOutlinedIcon /> },
  { to: '/accesos', label: 'Accesos', icon: <VpnKeyOutlinedIcon /> },
  { to: '/respaldos', label: 'Respaldos', icon: <BackupOutlinedIcon /> },
  { to: '/proveedores', label: 'Proveedores', icon: <HandshakeOutlinedIcon /> },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const { alertas } = useDashboardData();
  const location = useLocation();
  const navigate = useNavigate();
  const current = NAV.find((n) => n.to === location.pathname) ?? NAV[0];
  const criticas = alertas.filter((a) => a.severidad === 'error').length;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.main', color: '#fff' }}>
      <Box sx={{ px: 2.5, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#2a6fdb', width: 42, height: 42 }}>
          <ShieldOutlinedIcon />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>FEMAL IT Control</Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, lineHeight: 1.2, display: 'block' }}>
            Sistema de control y seguimiento de TI
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {NAV.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: 'rgba(255,255,255,0.78)',
              '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 40 },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
              '&.active': { bgcolor: 'rgba(255,255,255,0.14)', color: '#fff', fontWeight: 600 },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Button fullWidth size="small" startIcon={<RestartAltIcon />} onClick={() => setConfirmReset(true)} sx={{ color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.2)' }}>
          Restablecer datos demo
        </Button>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1.5, opacity: 0.5 }}>
          FEMAL, S.A. de C.V. · Auditoría Informática
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` }, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {current.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
              {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <Tooltip title={`${alertas.length} alertas activas (${criticas} críticas)`}>
            <IconButton onClick={() => navigate('/')}>
              <Badge badgeContent={alertas.length} color="error" max={99}>
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, ml: 2 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>GG</Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Gerente General
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Administrador
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 0 } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 0 } }}>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, p: { xs: 2, sm: 3 }, minWidth: 0 }}>
        <Toolbar />
        <Outlet />
      </Box>

      <ConfirmDialog
        open={confirmReset}
        title="Restablecer datos demo"
        message="Se reemplazará toda la información actual por los datos de demostración iniciales. ¿Deseas continuar?"
        confirmText="Restablecer"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          initDemoData(true);
          setConfirmReset(false);
        }}
      />
    </Box>
  );
}
