'use client';

import { Listing } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ListingForm } from 'src/features/listing/components/ListingForm';
import { listingFindApiCall } from 'src/features/listing/listingApiCalls';
import { listingLabel } from 'src/features/listing/listingLabel';
import { ListingWithRelationships } from 'src/features/listing/listingSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function ListingEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [listing, setListing] = useState<ListingWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setListing(undefined);
        const listing = await listingFindApiCall(id);

        if (!listing) {
          router.push('/listing');
        }

        setListing(listing);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/listing');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!listing) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.listing.list.menu, '/listing'],
          [listingLabel(listing, context.dictionary), `/listing/${listing?.id}`],
          [dictionary.listing.edit.menu],
        ]}
      />
      <div className="my-10">
        <ListingForm
          context={context}
          listing={listing}
          onSuccess={(listing: Listing) => router.push(`/listing/${listing.id}`)}
          onCancel={() => router.push('/listing')}
        />
      </div>
    </div>
  );
}
