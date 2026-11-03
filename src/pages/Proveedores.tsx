import { useState } from 'react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CrudPage, { type Column, type Field } from '../components/CrudPage';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusChip from '../components/StatusChip';
import { KEYS, newId, readList, writeList } from '../services/storage';
import { diasDesde, formatFecha } from '../services/rules';
import type { EstadoIncidencia, Incidencia, Proveedor } from '../types';

const ESTADOS = ['Activo', 'Revisión pendiente', 'Vencido'];
const ESTADOS_INC: EstadoIncidencia[] = ['Abierta', 'En proceso', 'Resuelta'];

const fields: Field<Proveedor>[] = [
  { key: 'proveedor', label: 'Proveedor', required: true },
  { key: 'servicio', label: 'Servicio', type: 'select', options: ['Soporte técnico', 'Facturación electrónica', 'Control volumétrico', 'Internet / telecomunicaciones', 'Software', 'Otro'], required: true },
  { key: 'responsableInterno', label: 'Responsable interno' },
  { key: 'contacto', label: 'Contacto' },
  { key: 'fechaInicio', label: 'Inicio de contrato', type: 'date', width: 'third' },
  { key: 'fechaVencimiento', label: 'Vencimiento de contrato', type: 'date', width: 'third' },
  { key: 'tiempoRespuesta', label: 'Tiempo de respuesta', width: 'third', helperText: 'Ej. 24 horas' },
  { key: 'contratoDisponible', label: 'Contrato disponible', type: 'switch', width: 'third' },
  { key: 'accesoRemoto', label: 'Tiene acceso remoto', type: 'switch', width: 'third' },
  { key: 'estado', label: 'Estado', type: 'select', options: ESTADOS, required: true, width: 'third' },
  { key: 'observaciones', label: 'Observaciones', type: 'multiline', width: 'full' },
];

const columns: Column<Proveedor>[] = [
  {
    label: 'Proveedor',
    render: (p) => (
      <>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {p.proveedor}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {p.contacto}
        </Typography>
      </>
    ),
  },
  { label: 'Servicio', render: (p) => p.servicio },
  { label: 'Responsable', render: (p) => p.responsableInterno },
  { label: 'Contrato', render: (p) => <Chip size="small" variant="outlined" label={p.contratoDisponible ? 'Disponible' : 'No disponible'} color={p.contratoDisponible ? 'success' : 'error'} /> },
  {
    label: 'Vigencia',
    render: (p) => {
      const vencido = p.fechaVencimiento && diasDesde(p.fechaVencimiento) > 0;
      return (
        <Typography variant="body2" color={vencido ? 'error' : 'inherit'} sx={{ whiteSpace: 'nowrap' }}>
          {formatFecha(p.fechaInicio)} – {formatFecha(p.fechaVencimiento)}
        </Typography>
      );
    },
  },
  { label: 'Respuesta', render: (p) => p.tiempoRespuesta },
  { label: 'Acceso remoto', render: (p) => <Chip size="small" variant="outlined" label={p.accesoRemoto ? 'Sí' : 'No'} color={p.accesoRemoto ? 'warning' : 'default'} /> },
  { label: 'Estado', render: (p) => <StatusChip value={p.estado} /> },
];

const emptyInc = (): Incidencia => ({ id: newId(), fecha: new Date().toISOString().slice(0, 10), problema: '', estado: 'Abierta', fechaSolucion: '' });

/** Registro simple de incidencias de un proveedor */
function IncidenciasDialog({ proveedorId, onClose }: { proveedorId: string; onClose: () => void }) {
  const [proveedor, setProveedor] = useState<Proveedor | undefined>(() => readList<Proveedor>(KEYS.proveedores).find((p) => p.id === proveedorId));
  const [form, setForm] = useState<Incidencia>(emptyInc);
  const [editing, setEditing] = useState(false);
  const [toDelete, setToDelete] = useState<Incidencia | null>(null);
  const [error, setError] = useState(false);

  if (!proveedor) return null;
  const incidencias = proveedor.incidencias ?? [];

  const persist = (list: Incidencia[]) => {
    const updated = { ...proveedor, incidencias: list };
    writeList(KEYS.proveedores, readList<Proveedor>(KEYS.proveedores).map((p) => (p.id === updated.id ? updated : p)));
    setProveedor(updated);
  };

  const handleSave = () => {
    if (!form.problema.trim()) {
      setError(true);
      return;
    }
    const inc = { ...form, fechaSolucion: form.estado === 'Resuelta' && !form.fechaSolucion ? new Date().toISOString().slice(0, 10) : form.fechaSolucion };
    persist(editing ? incidencias.map((i) => (i.id === inc.id ? inc : i)) : [inc, ...incidencias]);
    setForm(emptyInc());
    setEditing(false);
    setError(false);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Incidencias · {proveedor.proveedor}
        <Typography variant="body2" color="text.secondary">
          {proveedor.servicio} · Tiempo de respuesta comprometido: {proveedor.tiempoRespuesta || '—'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            {editing ? 'Editar incidencia' : 'Registrar nueva incidencia'}
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr 1fr 1fr' } }}>
            <TextField type="date" label="Fecha" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Problema" required error={error} helperText={error ? 'Describe el problema' : undefined} value={form.problema} onChange={(e) => setForm({ ...form, problema: e.target.value })} />
            <TextField select label="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoIncidencia })}>
              {ESTADOS_INC.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField type="date" label="Fecha de solución" value={form.fechaSolucion} onChange={(e) => setForm({ ...form, fechaSolucion: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
            {editing && (
              <Button onClick={() => { setForm(emptyInc()); setEditing(false); setError(false); }}>Cancelar edición</Button>
            )}
            <Button variant="contained" onClick={handleSave}>
              {editing ? 'Guardar cambios' : 'Agregar incidencia'}
            </Button>
          </Stack>
        </Paper>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Problema</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Solución</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidencias.map((i) => (
                <TableRow key={i.id} hover>
                  <TableCell>{formatFecha(i.fecha)}</TableCell>
                  <TableCell>{i.problema}</TableCell>
                  <TableCell>
                    <StatusChip value={i.estado} />
                  </TableCell>
                  <TableCell>{formatFecha(i.fechaSolucion)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" color="primary" onClick={() => { setForm(i); setEditing(true); setError(false); }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setToDelete(i)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {incidencias.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Sin incidencias registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
      <ConfirmDialog
        open={!!toDelete}
        message={`¿Eliminar la incidencia "${toDelete?.problema ?? ''}"?`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) persist(incidencias.filter((i) => i.id !== toDelete.id));
          setToDelete(null);
        }}
      />
    </Dialog>
  );
}

export default function Proveedores() {
  const [incFor, setIncFor] = useState<string | null>(null);
  return (
    <>
      <CrudPage<Proveedor>
        title="Proveedores tecnológicos"
        subtitle="Contratos, tiempos de respuesta, accesos remotos e incidencias con proveedores externos"
        icon={<HandshakeOutlinedIcon />}
        storageKey={KEYS.proveedores}
        singular="Proveedor"
        fields={fields}
        columns={columns}
        searchKeys={['proveedor', 'servicio', 'responsableInterno', 'contacto']}
        statusKey="estado"
        statusOptions={ESTADOS}
        rowLabel={(p) => p.proveedor}
        rowActions={(p) => (
          <Tooltip title="Incidencias">
            <IconButton size="small" onClick={() => setIncFor(p.id)}>
              <Badge badgeContent={(p.incidencias ?? []).filter((i) => i.estado !== 'Resuelta').length} color="error">
                <SupportAgentOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
        emptyItem={() => ({
          proveedor: '', servicio: 'Soporte técnico', responsableInterno: 'Gerente General', contacto: '', contratoDisponible: false,
          fechaInicio: new Date().toISOString().slice(0, 10), fechaVencimiento: '', tiempoRespuesta: '', accesoRemoto: false,
          estado: 'Activo', observaciones: '', incidencias: [],
        })}
      />
      {incFor && <IncidenciasDialog proveedorId={incFor} onClose={() => setIncFor(null)} />}
    </>
  );
}
