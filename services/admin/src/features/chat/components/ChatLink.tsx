import { Chat } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { chatLabel } from 'src/features/chat/chatLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function ChatLink({
  chat,
  context,
  className,
}: {
  chat?: Partial<Chat>;
  context: AppContext;
  className?: string;
}) {
  if (!chat) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.chatRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{chatLabel(chat, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/chat/${chat.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {chatLabel(chat, context.dictionary)}
    </Link>
  );
}
