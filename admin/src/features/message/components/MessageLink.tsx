import { Message } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { messageLabel } from 'src/features/message/messageLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function MessageLink({
  message,
  context,
  className,
}: {
  message?: Partial<Message>;
  context: AppContext;
  className?: string;
}) {
  if (!message) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.messageRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{messageLabel(message, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/message/${message.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {messageLabel(message, context.dictionary)}
    </Link>
  );
}
