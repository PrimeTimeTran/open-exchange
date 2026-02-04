import { LedgerEvent } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { ledgerEventLabel } from 'src/features/ledgerEvent/ledgerEventLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function LedgerEventLink({
  ledgerEvent,
  context,
  className,
}: {
  ledgerEvent?: Partial<LedgerEvent>;
  context: AppContext;
  className?: string;
}) {
  if (!ledgerEvent) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.ledgerEventRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{ledgerEventLabel(ledgerEvent, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/ledger-event/${ledgerEvent.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {ledgerEventLabel(ledgerEvent, context.dictionary)}
    </Link>
  );
}
