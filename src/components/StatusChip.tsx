import Chip from '@mui/material/Chip';

type ChipColor = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'secondary';

// Un solo mapa de colores para todos los estados del sistema
const COLORS: Record<string, ChipColor> = {
  // Accesos
  Activo: 'success',
  'Pendiente de revisión': 'warning',
  Revocado: 'default',
  Individual: 'primary',
  Compartida: 'warning',
  // Respaldos
  Conforme: 'success',
  'Pendiente de verificar': 'warning',
  'No conforme': 'error',
  Exitosa: 'success',
  Fallida: 'error',
  'No realizada': 'default',
  // Proveedores
  'Revisión pendiente': 'warning',
  Vencido: 'error',
  Abierta: 'error',
  'En proceso': 'info',
  Resuelta: 'success',
};

export default function StatusChip({ value, variant = 'filled' }: { value: string; variant?: 'filled' | 'outlined' }) {
  const color = COLORS[value] ?? 'default';
  return (
    <Chip
      label={value}
      color={color}
      size="small"
      variant={variant}
      sx={variant === 'filled' && color === 'warning' ? { color: '#4a2c00', bgcolor: '#ffcc80' } : undefined}
    />
  );
}
