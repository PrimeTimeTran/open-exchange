import { Deposit } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { depositLabel } from 'src/features/deposit/depositLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function DepositLink({
  deposit,
  context,
  className,
}: {
  deposit?: Partial<Deposit>;
  context: AppContext;
  className?: string;
}) {
  if (!deposit) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.depositRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{depositLabel(deposit, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/deposit/${deposit.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {depositLabel(deposit, context.dictionary)}
    </Link>
  );
}
