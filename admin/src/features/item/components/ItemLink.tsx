import { Item } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { itemLabel } from 'src/features/item/itemLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function ItemLink({
  item,
  context,
  className,
}: {
  item?: Partial<Item>;
  context: AppContext;
  className?: string;
}) {
  if (!item) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.itemRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{itemLabel(item, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/item/${item.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {itemLabel(item, context.dictionary)}
    </Link>
  );
}
