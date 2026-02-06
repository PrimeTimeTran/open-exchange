import React from 'react';
import { cookies } from 'next/headers';

import { Navbar, Footer } from '@/components';
import { ThemeProvider } from '@/components/theme-provider';
import { getDictionary } from '@/translation/getDictionary';
import { DesignSystemProvider } from '@/providers/design-system';
import { getLocaleFromCookies } from '@/translation/getLocaleFromCookies';
import { appContextForReact } from 'src/shared/controller/appContext';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: {
      default: dictionary.projectName,
      template: `%s - ${dictionary.projectName}`,
    },
    robots: {
      follow: true,
      index: true,
    },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await appContextForReact(cookies());

  return (
    <ThemeProvider
      enableSystem
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
    >
      <DesignSystemProvider>
        <Navbar currentUser={context.currentUser} />
        <main>{children}</main>
        <Footer />
      </DesignSystemProvider>
    </ThemeProvider>
  );
}
