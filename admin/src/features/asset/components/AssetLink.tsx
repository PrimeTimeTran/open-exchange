import { Asset } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { assetLabel } from 'src/features/asset/assetLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function AssetLink({
  asset,
  context,
  className,
}: {
  asset?: Partial<Asset>;
  context: AppContext;
  className?: string;
}) {
  if (!asset) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.assetRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{assetLabel(asset, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/asset/${asset.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {assetLabel(asset, context.dictionary)}
    </Link>
  );
}
