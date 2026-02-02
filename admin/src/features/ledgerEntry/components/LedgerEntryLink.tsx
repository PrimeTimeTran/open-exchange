import { LedgerEntry } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { ledgerEntryLabel } from 'src/features/ledgerEntry/ledgerEntryLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function LedgerEntryLink({
  ledgerEntry,
  context,
  className,
}: {
  ledgerEntry?: Partial<LedgerEntry>;
  context: AppContext;
  className?: string;
}) {
  if (!ledgerEntry) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.ledgerEntryRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{ledgerEntryLabel(ledgerEntry, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/ledger-entry/${ledgerEntry.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {ledgerEntryLabel(ledgerEntry, context.dictionary)}
    </Link>
  );
}
