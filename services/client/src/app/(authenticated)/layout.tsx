import React from 'react';
import { cookies } from 'next/headers';

import { Navbar } from '@/components';
import { TradeNotificationListener } from '@/components/TradeNotificationListener';
import { getDictionary } from '@/translation/getDictionary';
import { getLocaleFromCookies } from '@/translation/getLocaleFromCookies';
import { appContextForReact } from 'src/shared/controller/appContext';
import { LedgerProvider } from 'src/contexts/LedgerProvider';

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
      <TradeNotificationListener currentUserId={context.currentUser?.id} />
      <Navbar currentUser={context.currentUser} />
      <main className="min-h-screen bg-background">{children}</main>
    </LedgerProvider>
  );
}
