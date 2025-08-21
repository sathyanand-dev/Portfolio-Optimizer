import { createTheme } from '@mui/material/styles';

// Professional Enterprise Color Palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#2C3E50', // Deep Navy Blue - Professional and trustworthy
      light: '#34495E',
      dark: '#1A252F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#3498DB', // Professional Blue - Clean and modern
      light: '#5DADE2',
      dark: '#2980B9',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAFBFC', // Very subtle gray - Clean and minimal
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50', // Dark navy for primary text
      secondary: '#5D6D7E', // Muted gray for secondary text
    },
    success: {
      main: '#27AE60', // Professional green
      light: '#58D68D',
      dark: '#229954',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E74C3C', // Professional red
      light: '#EC7063',
      dark: '#C0392B',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F39C12', // Professional orange
      light: '#F8C471',
      dark: '#D68910',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#3498DB', // Same as secondary for consistency
      light: '#5DADE2',
      dark: '#2980B9',
      contrastText: '#FFFFFF',
    },
    grey: {
      50: '#FAFBFC',
      100: '#F4F6F8',
      200: '#E5E8EC',
      300: '#D1D9E0',
      400: '#B0BEC5',
      500: '#78909C',
      600: '#5D6D7E',
      700: '#455A64',
      800: '#34495E',
      900: '#2C3E50',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: '#2C3E50',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#2C3E50',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      color: '#2C3E50',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#2C3E50',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
      color: '#2C3E50',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2C3E50',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2C3E50',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#5D6D7E',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#5D6D7E',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#5D6D7E',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(44, 62, 80, 0.08), 0 1px 2px rgba(44, 62, 80, 0.04)',
          border: '1px solid #E5E8EC',
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(44, 62, 80, 0.12), 0 2px 4px rgba(44, 62, 80, 0.08)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(44, 62, 80, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(44, 62, 80, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: '#E5E8EC',
          color: '#2C3E50',
          '&:hover': {
            borderColor: '#3498DB',
            backgroundColor: 'rgba(52, 152, 219, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(44, 62, 80, 0.08)',
          border: '1px solid #E5E8EC',
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 1px 4px rgba(44, 62, 80, 0.08)',
        },
        elevation2: {
          boxShadow: '0 2px 8px rgba(44, 62, 80, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#2C3E50',
          boxShadow: '0 1px 4px rgba(44, 62, 80, 0.08)',
          borderBottom: '1px solid #E5E8EC',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F4F6F8',
          '& .MuiTableCell-head': {
            color: '#2C3E50',
            fontWeight: 600,
            borderBottom: '1px solid #E5E8EC',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F4F6F8',
          color: '#2C3E50',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        colorSuccess: {
          backgroundColor: '#D5EDDA',
          color: '#27AE60',
        },
        colorError: {
          backgroundColor: '#F8D7DA',
          color: '#E74C3C',
        },
        colorWarning: {
          backgroundColor: '#FFF3CD',
          color: '#F39C12',
        },
        colorInfo: {
          backgroundColor: '#CCE7F0',
          color: '#3498DB',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: '#D5EDDA',
          color: '#27AE60',
          border: '1px solid #27AE60',
        },
        standardError: {
          backgroundColor: '#F8D7DA',
          color: '#E74C3C',
          border: '1px solid #E74C3C',
        },
        standardWarning: {
          backgroundColor: '#FFF3CD',
          color: '#F39C12',
          border: '1px solid #F39C12',
        },
        standardInfo: {
          backgroundColor: '#CCE7F0',
          color: '#3498DB',
          border: '1px solid #3498DB',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#E5E8EC',
            },
            '&:hover fieldset': {
              borderColor: '#3498DB',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3498DB',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E5E8EC',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3498DB',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3498DB',
            borderWidth: 2,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        indicator: {
          backgroundColor: '#3498DB',
          height: 3,
          borderRadius: '2px 2px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
          color: '#5D6D7E',
          '&.Mui-selected': {
            color: '#3498DB',
            fontWeight: 600,
          },
        },
      },
    },
  },
});

export default theme;
