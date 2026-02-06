import { Fill } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { fillLabel } from 'src/features/fill/fillLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function FillLink({
  fill,
  context,
  className,
}: {
  fill?: Partial<Fill>;
  context: AppContext;
  className?: string;
}) {
  if (!fill) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.fillRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{fillLabel(fill, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/fill/${fill.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {fillLabel(fill, context.dictionary)}
    </Link>
  );
}
