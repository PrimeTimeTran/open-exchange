import { TradeFill } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { tradeFillLabel } from 'src/features/tradeFill/tradeFillLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function TradeFillLink({
  tradeFill,
  context,
  className,
}: {
  tradeFill?: Partial<TradeFill>;
  context: AppContext;
  className?: string;
}) {
  if (!tradeFill) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.tradeFillRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{tradeFillLabel(tradeFill, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/trade-fill/${tradeFill.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {tradeFillLabel(tradeFill, context.dictionary)}
    </Link>
  );
}
