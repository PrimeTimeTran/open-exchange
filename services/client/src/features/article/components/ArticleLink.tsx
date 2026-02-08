import { Article } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { articleLabel } from 'src/features/article/articleLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function ArticleLink({
  article,
  context,
  className,
}: {
  article?: Partial<Article>;
  context: AppContext;
  className?: string;
}) {
  if (!article) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.articleRead, context);

  if (!hasPermissionToRead) {
    return (
      <span className={className}>
        {articleLabel(article, context.dictionary)}
      </span>
    );
  }

  return (
    <Link
      href={`/admin/article/${article.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {articleLabel(article, context.dictionary)}
    </Link>
  );
}
