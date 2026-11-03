import { useMemo, useState, type ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmDialog from './ConfirmDialog';
import { newId, useCollection } from '../services/storage';

export type FieldType = 'text' | 'multiline' | 'date' | 'select' | 'switch' | 'number';

export interface Field<T> {
  key: keyof T & string;
  label: string;
  type?: FieldType;
  options?: string[];
  required?: boolean;
  /** Ancho en el formulario: 'full' ocupa toda la fila */
  width?: 'half' | 'full' | 'third';
  helperText?: string;
  min?: number;
  max?: number;
}

export interface Column<T> {
  label: string;
  render: (row: T) => ReactNode;
}

interface Props<T extends { id: string }> {
  title: string;
  subtitle: string;
  icon: ReactNode;
  storageKey: string;
  singular: string;
  fields: Field<T>[];
  columns: Column<T>[];
  emptyItem: () => Omit<T, 'id'>;
  searchKeys: (keyof T & string)[];
  statusKey: keyof T & string;
  statusOptions: string[];
  /** Ajusta el registro antes de guardar (campos calculados) */
  beforeSave?: (item: T) => T;
  /** Contenido extra dentro del formulario (vista previa de cálculos) */
  formExtra?: (draft: T) => ReactNode;
  /** Botones adicionales en la fila */
  rowActions?: (row: T) => ReactNode;
  /** Mensaje informativo arriba de la tabla */
  notice?: ReactNode;
  rowLabel: (row: T) => string;
}

export default function CrudPage<T extends { id: string }>(props: Props<T>) {
  const { title, subtitle, icon, storageKey, singular, fields, columns, emptyItem, searchKeys, statusKey, statusOptions, beforeSave, formExtra, rowActions, notice, rowLabel } = props;
  const { items, save, remove } = useCollection<T>(storageKey);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [draft, setDraft] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [toast, setToast] = useState('');

  const get = (row: T, key: string) => (row as Record<string, unknown>)[key];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((row) => {
      if (status !== 'Todos' && get(row, statusKey) !== status) return false;
      if (!q) return true;
      return searchKeys.some((k) => String(get(row, k) ?? '').toLowerCase().includes(q));
    });
  }, [items, search, status, searchKeys, statusKey]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((row) => {
      const s = String(get(row, statusKey));
      c[s] = (c[s] ?? 0) + 1;
    });
    return c;
  }, [items, statusKey]);

  const openNew = () => {
    setDraft({ id: newId(), ...emptyItem() } as T);
    setIsNew(true);
    setErrors({});
  };
  const openEdit = (row: T) => {
    setDraft({ ...row });
    setIsNew(false);
    setErrors({});
  };
  const setValue = (key: string, value: unknown) => setDraft((d) => (d ? ({ ...d, [key]: value } as T) : d));

  const handleSave = () => {
    if (!draft) return;
    const errs: Record<string, boolean> = {};
    fields.forEach((f) => {
      if (f.required && String(get(draft, f.key) ?? '').trim() === '') errs[f.key] = true;
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    save(beforeSave ? beforeSave(draft) : draft);
    setToast(isNew ? 'Registro agregado correctamente' : 'Registro actualizado correctamente');
    setDraft(null);
  };

  const handleDelete = () => {
    if (!toDelete) return;
    remove(toDelete.id);
    setToast('Registro eliminado');
    setToDelete(null);
  };

  const renderField = (f: Field<T>) => {
    if (!draft) return null;
    const value = get(draft, f.key);
    const span = f.width === 'full' ? 'span 6' : f.width === 'third' ? 'span 2' : 'span 3';
    const common = { label: f.label, required: f.required, error: !!errors[f.key], helperText: errors[f.key] ? 'Campo obligatorio' : f.helperText };
    let input: ReactNode;
    switch (f.type) {
      case 'switch':
        input = (
          <FormControlLabel
            sx={{ height: '100%', ml: 0 }}
            control={<Switch checked={!!value} onChange={(e) => setValue(f.key, e.target.checked)} />}
            label={f.label}
          />
        );
        break;
      case 'select':
        input = (
          <TextField select {...common} value={value ?? ''} onChange={(e) => setValue(f.key, e.target.value)}>
            {f.options?.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </TextField>
        );
        break;
      case 'date':
        input = <TextField type="date" {...common} value={value ?? ''} onChange={(e) => setValue(f.key, e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />;
        break;
      case 'number':
        input = (
          <TextField
            type="number"
            {...common}
            value={value ?? ''}
            onChange={(e) => {
              let n = Number(e.target.value);
              if (f.min !== undefined) n = Math.max(f.min, n);
              if (f.max !== undefined) n = Math.min(f.max, n);
              setValue(f.key, n);
            }}
            slotProps={{ htmlInput: { min: f.min, max: f.max } }}
          />
        );
        break;
      case 'multiline':
        input = <TextField multiline minRows={2} {...common} value={value ?? ''} onChange={(e) => setValue(f.key, e.target.value)} />;
        break;
      default:
        input = <TextField {...common} value={value ?? ''} onChange={(e) => setValue(f.key, e.target.value)} />;
    }
    return (
      <Box key={f.key} sx={{ gridColumn: { xs: 'span 6', sm: span } }}>
        {input}
      </Box>
    );
  };

  const visibleRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Encabezado */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', color: '#fff', display: 'grid', placeItems: 'center' }}>{icon}</Box>
          <Box>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}>
          Agregar {singular.toLowerCase()}
        </Button>
      </Stack>

      {notice}

      {/* Resumen por estado (clic para filtrar) */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
        <Chip label={`Todos · ${items.length}`} color={status === 'Todos' ? 'primary' : 'default'} variant={status === 'Todos' ? 'filled' : 'outlined'} onClick={() => { setStatus('Todos'); setPage(0); }} />
        {statusOptions.map((s) => (
          <Chip key={s} label={`${s} · ${counts[s] ?? 0}`} color={status === s ? 'primary' : 'default'} variant={status === s ? 'filled' : 'outlined'} onClick={() => { setStatus(s); setPage(0); }} />
        ))}
      </Stack>

      <Paper variant="outlined">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2 }}>
          <TextField
            placeholder="Buscar..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) } }}
            sx={{ maxWidth: { sm: 360 } }}
          />
          <TextField select label="Filtrar por estado" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} sx={{ maxWidth: { sm: 240 } }}>
            <MenuItem value="Todos">Todos</MenuItem>
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell key={c.label}>{c.label}</TableCell>
                ))}
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.id} hover>
                  {columns.map((c) => (
                    <TableCell key={c.label}>{c.render(row)}</TableCell>
                  ))}
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {rowActions?.(row)}
                    <Tooltip title="Editar">
                      <IconButton size="small" color="primary" onClick={() => openEdit(row)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => setToDelete(row)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {visibleRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No hay registros que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Paper>

      {/* Formulario agregar / editar */}
      <Dialog open={!!draft} onClose={() => setDraft(null)} maxWidth="md" fullWidth fullScreen={fullScreen}>
        <DialogTitle>{isNew ? `Agregar ${singular.toLowerCase()}` : `Editar ${singular.toLowerCase()}`}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, pt: 1 }}>{fields.map(renderField)}</Box>
          {draft && formExtra && <Box sx={{ mt: 2 }}>{formExtra(draft)}</Box>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDraft(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        message={toDelete ? `¿Seguro que deseas eliminar "${rowLabel(toDelete)}"? Esta acción no se puede deshacer.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" onClose={() => setToast('')}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
