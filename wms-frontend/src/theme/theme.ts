import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Black
    },
    secondary: {
      main: '#333333', // Dark Grey
    },
    background: {
      default: '#F5F5F7', // Very light grey (Apple-esque)
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111111', // Almost Black
      secondary: '#666666', // Grey
    },
    success: {
      main: '#10B981', // Emerald 500
    },
    warning: {
      main: '#F59E0B', // Amber 500
    },
    error: {
      main: '#EF4444', // Red 500
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em' },
    h2: { fontSize: '1.5rem', fontWeight: 600, color: '#334155', letterSpacing: '-0.025em' },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1rem', fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px 0px rgba(0,0,0,0.06)', // Tailwind shadow-sm
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          ':hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          backgroundColor: '#0F172A',
          ':hover': { backgroundColor: '#1E293B' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)', // Tailwind shadow-md
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F8FAFC',
          fontWeight: 600,
          color: '#475569',
        },
      },
    },
  },
});
