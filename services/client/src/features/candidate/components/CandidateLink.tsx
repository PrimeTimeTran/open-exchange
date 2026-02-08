import { Candidate } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { candidateLabel } from 'src/features/candidate/candidateLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function CandidateLink({
  candidate,
  context,
  className,
}: {
  candidate?: Partial<Candidate>;
  context: AppContext;
  className?: string;
}) {
  if (!candidate) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.candidateRead, context);

  if (!hasPermissionToRead) {
    return (
      <span className={className}>
        {candidateLabel(candidate, context.dictionary)}
      </span>
    );
  }

  return (
    <Link
      href={`/admin/candidate/${candidate.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {candidateLabel(candidate, context.dictionary)}
    </Link>
  );
}
