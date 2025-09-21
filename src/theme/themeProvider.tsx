'use client';

import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { createContext, useContext, useMemo, useState, useEffect } from 'react';

const ThemeToggleContext = createContext({ toggleTheme: () => {} });

export const useThemeToggle = () => useContext(ThemeToggleContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      setMode(stored);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newMode);
    setMode(newMode);
  };

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ThemeToggleContext.Provider value={{ toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeToggleContext.Provider>
  );
}
