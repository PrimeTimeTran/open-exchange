// src/providers/design-system-public.tsx
'use client';

import { useContext } from 'react';
import { generateTheme, applyTheme } from '@/utils/color';
import { DesignSystemContext, DesignSystemContextType } from './design-system';

export function PublicDesignSystem({
  children,
  defaultSeed = null,
}: {
  children: React.ReactNode;
  defaultSeed?: string | null;
}) {
  // Provide defaults for public pages
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
