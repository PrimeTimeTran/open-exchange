import React from 'react';
import { cookies } from 'next/headers';

import { PublicNavbar, Footer } from '@/components';
import { PublicThemeProvider } from '@/components/theme-provider-public';
import { getDictionary } from '@/translation/getDictionary';
import { PublicDesignSystem } from '@/providers/design-system-public';
import { getLocaleFromCookies } from '@/translation/getLocaleFromCookies';
import { appContextForReact } from 'src/shared/controller/appContext';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: {
      default: dictionary.projectName,
      // template: `%s - ${dictionary.projectName}`,
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
    <PublicThemeProvider
      enableSystem
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <PublicDesignSystem>
        {/* 
          Todo:
          Fix Hydration error warning.
        */}
        <PublicNavbar currentUser={context.currentUser} />
        <main>{children}</main>
        <Footer />
      </PublicDesignSystem>
    </PublicThemeProvider>
  );
}
