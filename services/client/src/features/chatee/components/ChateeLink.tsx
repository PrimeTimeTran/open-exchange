import { Chatee } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { chateeLabel } from 'src/features/chatee/chateeLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function ChateeLink({
  chatee,
  context,
  className,
}: {
  chatee?: Partial<Chatee>;
  context: AppContext;
  className?: string;
}) {
  if (!chatee) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.chateeRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{chateeLabel(chatee, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/chatee/${chatee.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {chateeLabel(chatee, context.dictionary)}
    </Link>
  );
}
