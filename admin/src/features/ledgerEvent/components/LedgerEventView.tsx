'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LedgerEventWithRelationships } from 'src/features/ledgerEvent/ledgerEventSchemas';
import { ledgerEventFindApiCall } from 'src/features/ledgerEvent/ledgerEventApiCalls';
import { LedgerEventActions } from 'src/features/ledgerEvent/components/LedgerEventActions';
import { ledgerEventPermissions } from 'src/features/ledgerEvent/ledgerEventPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { ledgerEntryLabel } from 'src/features/ledgerEntry/ledgerEntryLabel';
import { LedgerEntryLink } from 'src/features/ledgerEntry/components/LedgerEntryLink';
import { ledgerEventLabel } from 'src/features/ledgerEvent/ledgerEventLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function LedgerEventView({
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
    queryKey: ['ledgerEvent', id],
    queryFn: async ({ signal }) => {
      return await ledgerEventFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'ledgerEvent',
        ]) as Array<LedgerEventWithRelationships>
      )?.find((d) => d.id === id),
  });

  const ledgerEvent = query.data;

  if (query.isSuccess && !ledgerEvent) {
    router.push('/ledger-event');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/ledger-event');
    return null;
  }

  if (!ledgerEvent) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.ledgerEvent.list.menu, '/ledger-event'],
            [ledgerEventLabel(ledgerEvent, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <LedgerEventActions mode="view" ledgerEvent={ledgerEvent} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {ledgerEvent.type != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEvent.fields.type}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.ledgerEvent.enumerators.type,
                  ledgerEvent.type,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.ledgerEvent.enumerators.type,
                  ledgerEvent.type,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(ledgerEvent.referenceId) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEvent.fields.referenceId}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{ledgerEvent.referenceId}</span>
              <CopyToClipboardButton
                text={ledgerEvent.referenceId}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {ledgerEvent.referenceType != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEvent.fields.referenceType}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.ledgerEvent.enumerators.referenceType,
                  ledgerEvent.referenceType,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.ledgerEvent.enumerators.referenceType,
                  ledgerEvent.referenceType,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {ledgerEvent.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEvent.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.ledgerEvent.enumerators.status,
                  ledgerEvent.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.ledgerEvent.enumerators.status,
                  ledgerEvent.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(ledgerEvent.description) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEvent.fields.description}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{ledgerEvent.description}</span>
              <CopyToClipboardButton
                text={ledgerEvent.description}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {ledgerEvent.entries?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.ledgerEvent.fields.entries}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {ledgerEvent.entries?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <LedgerEntryLink
                    ledgerEntry={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={ledgerEntryLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}

        {ledgerEvent.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEvent.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={ledgerEvent.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  ledgerEvent.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {ledgerEvent.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEvent.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(ledgerEvent.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(ledgerEvent.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {ledgerEvent.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEvent.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={ledgerEvent.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  ledgerEvent.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {ledgerEvent.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEvent.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(ledgerEvent.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(ledgerEvent.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {ledgerEvent.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEvent.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={ledgerEvent.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  ledgerEvent.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {ledgerEvent.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.ledgerEvent.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(ledgerEvent.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(ledgerEvent.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
