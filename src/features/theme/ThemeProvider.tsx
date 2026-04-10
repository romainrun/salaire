import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { darkTheme, lightTheme, type AppTheme } from '../../constants/theme';

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useUIStore((s) => s.theme);
  const systemScheme = useColorScheme();

  const { theme, isDark } = useMemo(() => {
    let dark: boolean;
    if (themeMode === 'system') {
      dark = systemScheme !== 'light';
    } else {
      dark = themeMode === 'dark';
    }
    return { theme: dark ? darkTheme : lightTheme, isDark: dark };
  }, [themeMode, systemScheme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
