'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface ThemeContextType {
  isDark: boolean;
  setDark: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(() => {
    // Inicializar com base na rota atual
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/admin');
    }
    return false;
  });

  useEffect(() => {
    // Detectar se estamos em uma rota administrativa
    const isAdminRoute = pathname?.startsWith('/admin');
    setIsDark(isAdminRoute);

    // Aplicar classe dark no elemento html (apenas se mudou)
    const hasDarkClass = document.documentElement.classList.contains('dark');
    if (isAdminRoute && !hasDarkClass) {
      document.documentElement.classList.add('dark');
    } else if (!isAdminRoute && hasDarkClass) {
      document.documentElement.classList.remove('dark');
    }

    // Garantir que a classe theme-loaded está presente
    if (!document.documentElement.classList.contains('theme-loaded')) {
      document.documentElement.classList.add('theme-loaded');
    }
  }, [pathname]);

  const setDark = (dark: boolean) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return <ThemeContext.Provider value={{ isDark, setDark }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
