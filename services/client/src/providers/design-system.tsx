'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { generateTheme, applyTheme } from '@/utils/color';

type DesignSystemContextType = {
  currentSeed: string | null;
  setCurrentSeed: (seed: string | null) => void;
};

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(
  undefined,
);

export function DesignSystemProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [currentSeed, setCurrentSeed] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('design-system-seed');
    if (saved) setCurrentSeed(saved);
  }, []);

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

  // ⭐ CRITICAL PART
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
    throw new Error('useDesignSystem must be used within DesignSystemProvider');
  return context;
}
