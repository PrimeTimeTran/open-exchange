import { Wallet } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { walletLabel } from 'src/features/wallet/walletLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function WalletLink({
  wallet,
  context,
  className,
}: {
  wallet?: Partial<Wallet>;
  context: AppContext;
  className?: string;
}) {
  if (!wallet) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.walletRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{walletLabel(wallet, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/wallet/${wallet.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {walletLabel(wallet, context.dictionary)}
    </Link>
  );
}
