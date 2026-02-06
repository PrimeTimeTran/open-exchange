import { Navbar } from '@/components';
import { ThemeProvider } from '@/components/theme-provider';
import { DesignSystemProvider } from '@/providers/design-system';
import React from 'react';

export default function DashboardLayout({
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
        <Navbar />
        <main className="min-h-screen bg-background">{children}</main>
      </DesignSystemProvider>
    </ThemeProvider>
  );
}
