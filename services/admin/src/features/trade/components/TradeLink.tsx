import { Trade } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { tradeLabel } from 'src/features/trade/tradeLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function TradeLink({
  trade,
  context,
  className,
}: {
  trade?: Partial<Trade>;
  context: AppContext;
  className?: string;
}) {
  if (!trade) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.tradeRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{tradeLabel(trade, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/trade/${trade.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {tradeLabel(trade, context.dictionary)}
    </Link>
  );
}
