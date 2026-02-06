'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LedgerEntryWithRelationships } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { ledgerEntryFindApiCall } from 'src/features/ledgerEntry/ledgerEntryApiCalls';
import { LedgerEntryActions } from 'src/features/ledgerEntry/components/LedgerEntryActions';
import { ledgerEntryPermissions } from 'src/features/ledgerEntry/ledgerEntryPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { ledgerEventLabel } from 'src/features/ledgerEvent/ledgerEventLabel';
import { LedgerEventLink } from 'src/features/ledgerEvent/components/LedgerEventLink';
import { ledgerEntryLabel } from 'src/features/ledgerEntry/ledgerEntryLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function LedgerEntryView({
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
    queryKey: ['ledgerEntry', id],
    queryFn: async ({ signal }) => {
      return await ledgerEntryFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'ledgerEntry',
        ]) as Array<LedgerEntryWithRelationships>
      )?.find((d) => d.id === id),
  });

  const ledgerEntry = query.data;

  if (query.isSuccess && !ledgerEntry) {
    router.push('/ledger-entry');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/ledger-entry');
    return null;
  }

  if (!ledgerEntry) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.ledgerEntry.list.menu, '/ledger-entry'],
            [ledgerEntryLabel(ledgerEntry, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <LedgerEntryActions mode="view" ledgerEntry={ledgerEntry} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {ledgerEntry.amount != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEntry.fields.amount}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(ledgerEntry.amount?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  ledgerEntry.amount?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(ledgerEntry.accountId) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEntry.fields.accountId}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{ledgerEntry.accountId}</span>
              <CopyToClipboardButton
                text={ledgerEntry.accountId}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {ledgerEntry.event != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEntry.fields.event}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <LedgerEventLink ledgerEvent={ledgerEntry.event} context={context} />
              <CopyToClipboardButton
                text={ledgerEventLabel(ledgerEntry.event, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {ledgerEntry.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEntry.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={ledgerEntry.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  ledgerEntry.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {ledgerEntry.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEntry.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(ledgerEntry.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(ledgerEntry.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {ledgerEntry.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEntry.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={ledgerEntry.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  ledgerEntry.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {ledgerEntry.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEntry.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(ledgerEntry.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(ledgerEntry.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {ledgerEntry.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEntry.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={ledgerEntry.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  ledgerEntry.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {ledgerEntry.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEntry.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(ledgerEntry.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(ledgerEntry.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
