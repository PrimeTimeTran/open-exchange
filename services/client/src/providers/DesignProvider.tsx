'use client';

import { useTheme } from 'next-themes';
import { createContext, useContext, useEffect, useState } from 'react';
import { generateTheme, applyTheme } from '@/utils/color';

export type DesignSystemContextType = {
  currentSeed: string | null;
  setCurrentSeed: (seed: string | null) => void;
};

// Export context so it can be used if needed directly, though useDesignSystem is preferred
export const DesignSystemContext = createContext<
  DesignSystemContextType | undefined
>(undefined);

interface DesignProviderProps {
  children: React.ReactNode;
  /**
   * Optional default seed for scenarios where you want to force a specific theme
   * or provide a starting value (e.g., public pages).
   * If provided, it will be used as the initial state.
   */
  defaultSeed?: string | null;
}

export function DesignProvider({
  children,
  defaultSeed = null,
}: DesignProviderProps) {
  const { resolvedTheme } = useTheme();
  // Initialize with defaultSeed if provided
  const [currentSeed, setCurrentSeed] = useState<string | null>(defaultSeed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only load from local storage if no defaultSeed was forced/provided,
    // OR if you want local storage to override props (usually props override storage).
    // Here we'll let local storage take precedence if it exists, otherwise fall back to defaultSeed.
    const saved = localStorage.getItem('design-system-seed');
    if (saved) {
      setCurrentSeed(saved);
    } else if (defaultSeed) {
      setCurrentSeed(defaultSeed);
    }
  }, [defaultSeed]);

  useEffect(() => {
    if (!mounted) return;
    if (currentSeed) {
      localStorage.setItem('design-system-seed', currentSeed);
    } else {
      localStorage.removeItem('design-system-seed');
    }
  }, [currentSeed, mounted]);

  useEffect(() => {
    if (!mounted) return;

    if (!currentSeed) {
      document.documentElement.removeAttribute('style');
      return;
    }

    const vars = generateTheme(
      currentSeed,
      resolvedTheme === 'dark' ? 'dark' : 'light',
    );
    applyTheme(vars);
  }, [resolvedTheme, currentSeed, mounted]);

  // Prevent hydration mismatch by waiting for mount
  if (!mounted) return null;

  return (
    <DesignSystemContext.Provider value={{ currentSeed, setCurrentSeed }}>
      {children}
    </DesignSystemContext.Provider>
  );
}

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (!context)
    throw new Error('useDesignSystem must be used within DesignProvider');
  return context;
}
