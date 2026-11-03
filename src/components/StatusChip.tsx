import Chip from '@mui/material/Chip';

type ChipColor = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'secondary';

// Un solo mapa de colores para todos los estados del sistema
const COLORS: Record<string, ChipColor> = {
  // Equipos
  Operativo: 'success',
  'Requiere revisión': 'warning',
  Mantenimiento: 'info',
  Obsoleto: 'error',
  // Accesos
  Activo: 'success',
  'Pendiente de revisión': 'warning',
  Revocado: 'default',
  Individual: 'primary',
  Compartida: 'warning',
  // Respaldos
  Correcto: 'success',
  'Pendiente de validar': 'warning',
  Fallido: 'error',
  Exitosa: 'success',
  Fallida: 'error',
  'No realizada': 'default',
  // Proveedores
  'Revisión pendiente': 'warning',
  Vencido: 'error',
  Abierta: 'error',
  Resuelta: 'success',
  // Riesgos
  Crítico: 'error',
  Alto: 'warning',
  Medio: 'info',
  Bajo: 'success',
  Abierto: 'error',
  'En proceso': 'info',
  Atendido: 'success',
  Aceptado: 'default',
  Riesgo: 'primary',
  Hallazgo: 'secondary',
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
