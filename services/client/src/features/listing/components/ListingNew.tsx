'use client';

import { Listing } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ListingForm } from 'src/features/listing/components/ListingForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function ListingNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <ListingForm
      context={context}
      onSuccess={(listing: Listing) =>
        router.push(`/listing/${listing.id}`)
      }
      onCancel={() => router.push('/listing')}
    />
  );
}
