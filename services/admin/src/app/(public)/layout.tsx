import { ThemeProvider } from '@/components/theme-provider';
import { DesignSystemProvider } from '@/providers/design-system';
import React from 'react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      enableSystem
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
    >
      <DesignSystemProvider>
        <header>
          <div className="max-w-7xl px-4 py-6 sm:px-6 ">
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Open Exchange
            </h1>
          </div>
        </header>
        <main>{children}</main>
      </DesignSystemProvider>
    </ThemeProvider>
  );
}
