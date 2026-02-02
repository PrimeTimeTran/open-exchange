import { Comment } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { commentLabel } from 'src/features/comment/commentLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function CommentLink({
  comment,
  context,
  className,
}: {
  comment?: Partial<Comment>;
  context: AppContext;
  className?: string;
}) {
  if (!comment) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.commentRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{commentLabel(comment, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/comment/${comment.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {commentLabel(comment, context.dictionary)}
    </Link>
  );
}
