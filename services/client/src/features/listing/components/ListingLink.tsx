import { Listing } from '@prisma/client';
import Link from 'src/shared/components/Link';
import React from 'react';
import { listingLabel } from 'src/features/listing/listingLabel';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { cn } from 'src/shared/components/cn';

export function ListingLink({
  listing,
  context,
  className,
}: {
  listing?: Partial<Listing>;
  context: AppContext;
  className?: string;
}) {
  if (!listing) {
    return '';
  }

  const hasPermissionToRead = hasPermission(permissions.listingRead, context);

  if (!hasPermissionToRead) {
    return (
      <span className={className}>
        {listingLabel(listing, context.dictionary)}
      </span>
    );
  }

  return (
    <Link
      href={`/admin/listing/${listing.id}`}
      className={cn(
        'text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400',
        className,
      )}
      prefetch={false}
    >
      {listingLabel(listing, context.dictionary)}
    </Link>
  );
}
