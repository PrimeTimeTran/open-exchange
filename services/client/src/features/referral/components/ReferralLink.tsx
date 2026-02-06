import { Referral } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { referralLabel } from 'src/features/referral/referralLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function ReferralLink({
  referral,
  context,
  className,
}: {
  referral?: Partial<Referral>;
  context: AppContext;
  className?: string;
}) {
  if (!referral) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.referralRead, context);

  if (!hasPermissionToRead) {
    return <span className={className}>{referralLabel(referral, context.dictionary)}</span>;
  }

  return (
    <Link
      href={`/referral/${referral.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {referralLabel(referral, context.dictionary)}
    </Link>
  );
}
