import { Job } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { jobLabel } from 'src/features/job/jobLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function JobLink({
  job,
  context,
  className,
}: {
  job?: Partial<Job>;
  context: AppContext;
  className?: string;
}) {
  if (!job) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.jobRead, context);

  if (!hasPermissionToRead) {
    return (
      <span className={className}>{jobLabel(job, context.dictionary)}</span>
    );
  }

  return (
    <Link
      href={`/admin/job/${job.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {jobLabel(job, context.dictionary)}
    </Link>
  );
}
