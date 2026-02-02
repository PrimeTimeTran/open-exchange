'use client';

import UnsavedChangesProvider from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <UnsavedChangesProvider>{children}</UnsavedChangesProvider>;
}
