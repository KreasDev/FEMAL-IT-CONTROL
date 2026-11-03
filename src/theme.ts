import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0b2545', light: '#1d3f6e', dark: '#061a33', contrastText: '#ffffff' },
    secondary: { main: '#2a6fdb' },
    background: { default: '#f3f5f9', paper: '#ffffff' },
    text: { primary: '#14213d', secondary: '#5b6577' },
    divider: '#e3e7ef',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid #e3e7ef' } },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 12 } } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: '#5b6577', backgroundColor: '#f8f9fc', whiteSpace: 'nowrap' },
        root: { borderColor: '#edf0f5' },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700 } } },
  },
});
