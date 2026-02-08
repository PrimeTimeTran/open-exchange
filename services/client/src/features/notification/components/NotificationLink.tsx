import { Notification } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { notificationLabel } from 'src/features/notification/notificationLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function NotificationLink({
  notification,
  context,
  className,
}: {
  notification?: Partial<Notification>;
  context: AppContext;
  className?: string;
}) {
  if (!notification) {
    return '';
  }

  const hasPermissionToRead = hasPermission(
    permissions.notificationRead,
    context,
  );

  if (!hasPermissionToRead) {
    return (
      <span className={className}>
        {notificationLabel(notification, context.dictionary)}
      </span>
    );
  }

  return (
    <Link
      href={`/admin/notification/${notification.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {notificationLabel(notification, context.dictionary)}
    </Link>
  );
}
