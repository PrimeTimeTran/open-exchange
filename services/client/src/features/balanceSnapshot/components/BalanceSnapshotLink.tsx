import { BalanceSnapshot } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { balanceSnapshotLabel } from 'src/features/balanceSnapshot/balanceSnapshotLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function BalanceSnapshotLink({
  balanceSnapshot,
  context,
  className,
}: {
  balanceSnapshot?: Partial<BalanceSnapshot>;
  context: AppContext;
  className?: string;
}) {
  if (!balanceSnapshot) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.balanceSnapshotRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{balanceSnapshotLabel(balanceSnapshot, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/admin/balance-snapshot/${balanceSnapshot.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {balanceSnapshotLabel(balanceSnapshot, context.dictionary)}
    </Link>
  );
}
