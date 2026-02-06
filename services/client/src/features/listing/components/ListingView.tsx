'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ListingWithRelationships } from 'src/features/listing/listingSchemas';
import { listingFindApiCall } from 'src/features/listing/listingApiCalls';
import { ListingActions } from 'src/features/listing/components/ListingActions';
import { listingPermissions } from 'src/features/listing/listingPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { formatDate } from 'src/shared/lib/formatDate';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { listingLabel } from 'src/features/listing/listingLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function ListingView({
  id,
  context,
}: {
  id: string;
  context: AppContext;
}) {
  const { dictionary } = context;
  const queryClient = useQueryClient();
  const router = useRouter();

  const query = useQuery({
    queryKey: ['listing', id],
    queryFn: async ({ signal }) => {
      return await listingFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'listing',
        ]) as Array<ListingWithRelationships>
      )?.find((d) => d.id === id),
  });

  const listing = query.data;

  if (query.isSuccess && !listing) {
    router.push('/listing');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/listing');
    return null;
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.listing.list.menu, '/listing'],
            [listingLabel(listing, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <ListingActions mode="view" listing={listing} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(listing.companyName) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.companyName}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{listing.companyName}</span>
              <CopyToClipboardButton
                text={listing.companyName}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(listing.legalName) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.legalName}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{listing.legalName}</span>
              <CopyToClipboardButton
                text={listing.legalName}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(listing.jurisdiction) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.jurisdiction}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{listing.jurisdiction}</span>
              <CopyToClipboardButton
                text={listing.jurisdiction}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {listing.incorporationDate != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.incorporationDate}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDate(listing.incorporationDate, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDate(listing.incorporationDate, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(listing.website) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.website}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{listing.website}</span>
              <CopyToClipboardButton
                text={listing.website}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(listing.assetSymbol) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.assetSymbol}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{listing.assetSymbol}</span>
              <CopyToClipboardButton
                text={listing.assetSymbol}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {listing.assetClass != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.assetClass}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.listing.enumerators.assetClass,
                  listing.assetClass,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.listing.enumerators.assetClass,
                  listing.assetClass,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {listing.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.listing.enumerators.status,
                  listing.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.listing.enumerators.status,
                  listing.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {listing.submittedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.submittedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDate(listing.submittedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDate(listing.submittedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {listing.decisionAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.decisionAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDate(listing.decisionAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDate(listing.decisionAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {listing.kycCompleted != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.kycCompleted}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {listing.kycCompleted
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  listing.kycCompleted
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {listing.docsSubmitted != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.docsSubmitted}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {listing.docsSubmitted
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  listing.docsSubmitted
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(listing.riskDisclosureUrl) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.riskDisclosureUrl}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{listing.riskDisclosureUrl}</span>
              <CopyToClipboardButton
                text={listing.riskDisclosureUrl}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(listing.primaryContactName) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.primaryContactName}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{listing.primaryContactName}</span>
              <CopyToClipboardButton
                text={listing.primaryContactName}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(listing.primaryContactEmail) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.primaryContactEmail}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{listing.primaryContactEmail}</span>
              <CopyToClipboardButton
                text={listing.primaryContactEmail}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(listing.reviewedBy) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.reviewedBy}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{listing.reviewedBy}</span>
              <CopyToClipboardButton
                text={listing.reviewedBy}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(listing.notes) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.notes}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{listing.notes}</span>
              <CopyToClipboardButton
                text={listing.notes}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {listing.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={listing.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  listing.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {listing.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(listing.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(listing.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {listing.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={listing.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  listing.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {listing.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(listing.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(listing.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {listing.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={listing.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  listing.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {listing.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.listing.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(listing.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(listing.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
