import { Account } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { accountLabel } from 'src/features/account/accountLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function AccountLink({
  account,
  context,
  className,
}: {
  account?: Partial<Account>;
  context: AppContext;
  className?: string;
}) {
  if (!account) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.accountRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{accountLabel(account, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/account/${account.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {accountLabel(account, context.dictionary)}
    </Link>
  );
}
