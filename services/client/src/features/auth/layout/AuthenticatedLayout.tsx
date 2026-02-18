import React from 'react';
import { cookies, headers } from 'next/headers';
import { authGuard } from 'src/features/auth/authGuard';
import { ThemeProvider } from '@/components/theme-provider';
import { DesignSystemProvider } from '@/providers/DesignProvider';
import { appContextForReact } from 'src/shared/controller/appContext';
import AuthenticatedHeader from 'src/features/auth/layout/AuthenticatedHeader';
import { AuthenticatedMenu } from 'src/features/auth/layout/AuthenticatedMenu';
import { AuthenticatedSidebar } from 'src/features/auth/layout/AuthenticatedSidebar';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await appContextForReact(cookies());
  const headersList = headers();
  const currentUrl = headersList.get('x-url') || '';
  authGuard(context, undefined, currentUrl);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DesignSystemProvider>
        <div className="flex min-h-screen flex-col">
          <AuthenticatedHeader context={context} />

          <div className="flex flex-1">
            <AuthenticatedSidebar context={context} />
            <div className="mt-6 flex-1 overflow-x-hidden px-8 lg:pl-[18rem] xl:pl-[20rem]">
              {children}
            </div>
          </div>
        </div>
      </DesignSystemProvider>
    </ThemeProvider>
  );
}
