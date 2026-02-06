import { UserNotification } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { userNotificationLabel } from 'src/features/userNotification/userNotificationLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function UserNotificationLink({
  userNotification,
  context,
  className,
}: {
  userNotification?: Partial<UserNotification>;
  context: AppContext;
  className?: string;
}) {
  if (!userNotification) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.userNotificationRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{userNotificationLabel(userNotification, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/user-notification/${userNotification.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {userNotificationLabel(userNotification, context.dictionary)}
    </Link>
  );
}
