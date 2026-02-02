import { FeeSchedule } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { feeScheduleLabel } from 'src/features/feeSchedule/feeScheduleLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function FeeScheduleLink({
  feeSchedule,
  context,
  className,
}: {
  feeSchedule?: Partial<FeeSchedule>;
  context: AppContext;
  className?: string;
}) {
  if (!feeSchedule) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.feeScheduleRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{feeScheduleLabel(feeSchedule, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/fee-schedule/${feeSchedule.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {feeScheduleLabel(feeSchedule, context.dictionary)}
    </Link>
  );
}
