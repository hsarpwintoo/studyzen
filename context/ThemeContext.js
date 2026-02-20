import React, { createContext, useContext, useState } from 'react';

const light = {
  dark: false,
  bg:      '#F5EFE6',
  card:    '#FDF8F2',
  input:   '#EDE3D8',
  border:  '#E0D0C0',
  sep:     '#E0D0C0',
  text:    '#3E2723',
  textSec: '#A1887F',
  accent:  '#C0714F',
  brown:   '#6B4226',
  tabBg:   '#FDF8F2',
  tabBorder: '#EDE3D8',
};

const dark = {
  dark: true,
  bg:      '#1A1210',
  card:    '#2C1F1A',
  input:   '#3D2B24',
  border:  '#4A3028',
  sep:     '#3D2B24',
  text:    '#F5EFE6',
  textSec: '#A1887F',
  accent:  '#C0714F',
  brown:   '#8B5A3A',
  tabBg:   '#2C1F1A',
  tabBorder: '#3D2B24',
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? dark : light;
  const toggleDark = () => setIsDark(d => !d);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
