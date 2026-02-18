import React from 'react';
import { cookies } from 'next/headers';

import { Navbar } from '@/components';
import { getDictionary } from '@/translation/getDictionary';
import { LedgerProvider } from 'src/contexts/LedgerProvider';
import { TradeStreamProvider } from '@/providers/TradeStreamProvider';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getLocaleFromCookies } from '@/translation/getLocaleFromCookies';

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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await appContextForReact(cookies());

  return (
    <LedgerProvider>
      <TradeStreamProvider currentUserId={context.currentUser?.id} />
      <Navbar currentUser={context.currentUser} />
      <main className="min-h-screen bg-background">{children}</main>
    </LedgerProvider>
  );
}
