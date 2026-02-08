import { Instrument } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { instrumentLabel } from 'src/features/instrument/instrumentLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function InstrumentLink({
  instrument,
  context,
  className,
}: {
  instrument?: Partial<Instrument>;
  context: AppContext;
  className?: string;
}) {
  if (!instrument) {
    return '';
  }

  const hasPermissionToRead = hasPermission(
    permissions.instrumentRead,
    context,
  );

  if (!hasPermissionToRead) {
    return (
      <span className={className}>
        {instrumentLabel(instrument, context.dictionary)}
      </span>
    );
  }

  return (
    <Link
      href={`/admin/instrument/${instrument.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {instrumentLabel(instrument, context.dictionary)}
    </Link>
  );
}
