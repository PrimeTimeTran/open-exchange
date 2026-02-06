import { SystemAccount } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { systemAccountLabel } from 'src/features/systemAccount/systemAccountLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function SystemAccountLink({
  systemAccount,
  context,
  className,
}: {
  systemAccount?: Partial<SystemAccount>;
  context: AppContext;
  className?: string;
}) {
  if (!systemAccount) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.systemAccountRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{systemAccountLabel(systemAccount, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/system-account/${systemAccount.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {systemAccountLabel(systemAccount, context.dictionary)}
    </Link>
  );
}
