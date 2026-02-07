// src/providers/design-system-public.tsx
'use client'; // <- THIS IS CRITICAL

import { createContext, useContext } from 'react';
import { generateTheme, applyTheme } from '@/utils/color';

type DesignSystemContextType = {
  currentSeed: string | null;
  setCurrentSeed: (seed: string | null) => void;
};

export const DesignSystemContext = createContext<
  DesignSystemContextType | undefined
>(undefined);

export function PublicDesignSystem({
  children,
  defaultSeed = null,
}: {
  children: React.ReactNode;
  defaultSeed?: string | null;
}) {
  // SSR-safe: only applies default theme
  return (
    <DesignSystemContext.Provider
      value={{ currentSeed: defaultSeed, setCurrentSeed: () => {} }}
    >
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
