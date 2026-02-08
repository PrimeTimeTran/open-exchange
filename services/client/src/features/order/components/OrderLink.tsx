import { Order } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { orderLabel } from 'src/features/order/orderLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function OrderLink({
  order,
  context,
  className,
}: {
  order?: Partial<Order>;
  context: AppContext;
  className?: string;
}) {
  if (!order) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.orderRead, context);

  if (!hasPermissionToRead) {
    return (
      <span className={className}>{orderLabel(order, context.dictionary)}</span>
    );
  }

  return (
    <Link
      href={`/admin/order/${order.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {orderLabel(order, context.dictionary)}
    </Link>
  );
}
