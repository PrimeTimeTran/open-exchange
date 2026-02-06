import React from 'react';
import { cookies } from 'next/headers';

import { Navbar } from '@/components';
import { ThemeProvider } from '@/components/theme-provider';
import { DesignSystemProvider } from '@/providers/design-system';
import { getDictionary } from '@/translation/getDictionary';
import { getLocaleFromCookies } from '@/translation/getLocaleFromCookies';

export async function generateMetadata() {
  try {
    const locale = getLocaleFromCookies(cookies()) ?? 'en';
    const dictionary = await getDictionary(locale);

    return {
      title: {
        default: dictionary.projectName,
      },
      robots: {
        follow: true,
        index: true,
      },
    };
  } catch (err) {
    console.error('generateMetadata failed', err);

    // Fallback metadata — DO NOT throw
    return {
      title: 'Open Exchange',
      robots: {
        follow: true,
        index: true,
      },
    };
  }
}

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
