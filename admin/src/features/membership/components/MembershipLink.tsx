import { Membership } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function MembershipLink({
  membership,
  context,
  className,
}: {
  membership?: Partial<Membership>;
  context: AppContext;
  className?: string;
}) {
  if (!membership) {
    return '';
  }

  const hasPermissionToRead = hasPermission(
    permissions.membershipRead,
    context,
  );

  if (!hasPermissionToRead) {
    return <span className={className}>{membershipLabel(membership, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/membership/${membership.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {membershipLabel(membership, context.dictionary)}
    </Link>
  );
}
