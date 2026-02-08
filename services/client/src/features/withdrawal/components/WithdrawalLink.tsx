import { Withdrawal } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { withdrawalLabel } from 'src/features/withdrawal/withdrawalLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function WithdrawalLink({
  withdrawal,
  context,
  className,
}: {
  withdrawal?: Partial<Withdrawal>;
  context: AppContext;
  className?: string;
}) {
  if (!withdrawal) {
    return '';
  }

  const hasPermissionToRead = hasPermission(
    permissions.withdrawalRead,
    context,
  );

  if (!hasPermissionToRead) {
    return (
      <span className={className}>
        {withdrawalLabel(withdrawal, context.dictionary)}
      </span>
    );
  }

  return (
    <Link
      href={`/admin/withdrawal/${withdrawal.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {withdrawalLabel(withdrawal, context.dictionary)}
    </Link>
  );
}
