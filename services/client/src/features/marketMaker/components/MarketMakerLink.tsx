import { MarketMaker } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { marketMakerLabel } from 'src/features/marketMaker/marketMakerLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function MarketMakerLink({
  marketMaker,
  context,
  className,
}: {
  marketMaker?: Partial<MarketMaker>;
  context: AppContext;
  className?: string;
}) {
  if (!marketMaker) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.marketMakerRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{marketMakerLabel(marketMaker, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/market-maker/${marketMaker.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {marketMakerLabel(marketMaker, context.dictionary)}
    </Link>
  );
}
