import { Post } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { postLabel } from 'src/features/post/postLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function PostLink({
  post,
  context,
  className,
}: {
  post?: Partial<Post>;
  context: AppContext;
  className?: string;
}) {
  if (!post) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.postRead, context);

  if (!hasPermissionToRead) {
    return (
      <span className={className}>{postLabel(post, context.dictionary)}</span>
    );
  }

  return (
    <Link
      href={`/admin/post/${post.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {postLabel(post, context.dictionary)}
    </Link>
  );
}
