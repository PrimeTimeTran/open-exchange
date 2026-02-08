import { Feedback } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { feedbackLabel } from 'src/features/feedback/feedbackLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function FeedbackLink({
  feedback,
  context,
  className,
}: {
  feedback?: Partial<Feedback>;
  context: AppContext;
  className?: string;
}) {
  if (!feedback) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.feedbackRead, context);

  if (!hasPermissionToRead) {
    return (
      <span className={className}>
        {feedbackLabel(feedback, context.dictionary)}
      </span>
    );
  }

  return (
    <Link
      href={`/admin/feedback/${feedback.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {feedbackLabel(feedback, context.dictionary)}
    </Link>
  );
}
