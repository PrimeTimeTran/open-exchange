import React from 'react';
import { AuthenticatedMenu } from 'src/features/auth/layout/AuthenticatedMenu';
import { AuthenticatedUserNav } from 'src/features/auth/layout/AuthenticatedUserNav';
import TenantSwitcher from 'src/features/tenant/components/TenantSwitcher';
import { ModeToggle } from 'src/shared/components/ModeToggler';
import { AppContext } from 'src/shared/controller/appContext';
import LocaleSwitcher from 'src/translation/LanguageSwitcher';

export function AuthenticatedSidebar({ context }: { context: AppContext }) {
  return (
    <div className="fixed hidden h-screen w-[16rem] shrink-0 bg-gray-100 p-6 text-gray-800 shadow dark:bg-gray-900 dark:text-gray-200 lg:flex lg:flex-col xl:w-[18rem]">
      <div className="mb-4 flex items-center space-x-1">
        <h1 className="pl-7 text-lg font-medium">
          {context.dictionary.projectName}
        </h1>
      </div>

      <AuthenticatedMenu context={context} />

      <div className="mt-2 space-y-1">
        <LocaleSwitcher
          dictionary={context.dictionary}
          locale={context.locale}
          isSidebar
        />

        <ModeToggle dictionary={context.dictionary} isSidebar />

        {process.env.NEXT_PUBLIC_TENANT_MODE === 'multi' ? (
          <TenantSwitcher context={context} isSidebar />
        ) : (
          ''
        )}

        <AuthenticatedUserNav context={context} isSidebar />
      </div>
    </div>
  );
}
