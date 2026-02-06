'use client';

import { AuthenticatedMenu } from 'src/features/auth/layout/AuthenticatedMenu';
import { AuthenticatedUserNav } from 'src/features/auth/layout/AuthenticatedUserNav';
import TenantSwitcher from 'src/features/tenant/components/TenantSwitcher';
import { AppContext } from 'src/shared/controller/appContext';
import { ModeToggle } from 'src/shared/components/ModeToggler';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from 'src/shared/components/ui/sheet';
import LocaleSwitcher from 'src/translation/LanguageSwitcher';
import { LuMenu } from 'react-icons/lu';
import { useState } from 'react';

export default function AuthenticatedHeader({
  context,
}: {
  context: AppContext;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 w-full bg-gray-100 dark:bg-muted">
      <div className="flex items-center p-4 pl-6 lg:hidden">
        <div className="mr-2 flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="text-muted-foreground">
                <LuMenu />
              </button>
            </SheetTrigger>
            <SheetContent side={'left'}>
              <h2 className="mb-6 flex items-center gap-2 px-2 text-lg font-semibold tracking-tight">
                {context.dictionary.projectName}
              </h2>
              <div className="pr-2">
                <AuthenticatedMenu
                  context={context}
                  onMenuClick={() => setOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <h2 className="hidden items-center gap-2 px-2 text-lg font-semibold tracking-tight sm:flex">
          {context.dictionary.projectName}
        </h2>

        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle dictionary={context.dictionary} />
          <LocaleSwitcher
            dictionary={context.dictionary}
            locale={context.locale}
          />
          {process.env.NEXT_PUBLIC_TENANT_MODE === 'multi' ? (
            <TenantSwitcher context={context} />
          ) : (
            ''
          )}
          <AuthenticatedUserNav context={context} />
        </div>
      </div>
    </div>
  );
}
