import { Chater } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { chaterLabel } from 'src/features/chater/chaterLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function ChaterLink({
  chater,
  context,
  className,
}: {
  chater?: Partial<Chater>;
  context: AppContext;
  className?: string;
}) {
  if (!chater) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.chaterRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{chaterLabel(chater, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/chater/${chater.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {chaterLabel(chater, context.dictionary)}
    </Link>
  );
}
