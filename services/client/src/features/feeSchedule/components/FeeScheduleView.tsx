'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FeeScheduleWithRelationships } from 'src/features/feeSchedule/feeScheduleSchemas';
import { feeScheduleFindApiCall } from 'src/features/feeSchedule/feeScheduleApiCalls';
import { FeeScheduleActions } from 'src/features/feeSchedule/components/FeeScheduleActions';
import { feeSchedulePermissions } from 'src/features/feeSchedule/feeSchedulePermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { feeScheduleLabel } from 'src/features/feeSchedule/feeScheduleLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function FeeScheduleView({
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
    queryKey: ['feeSchedule', id],
    queryFn: async ({ signal }) => {
      return await feeScheduleFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'feeSchedule',
        ]) as Array<FeeScheduleWithRelationships>
      )?.find((d) => d.id === id),
  });

  const feeSchedule = query.data;

  if (query.isSuccess && !feeSchedule) {
    router.push('/fee-schedule');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/fee-schedule');
    return null;
  }

  if (!feeSchedule) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.feeSchedule.list.menu, '/fee-schedule'],
            [feeScheduleLabel(feeSchedule, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <FeeScheduleActions mode="view" feeSchedule={feeSchedule} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {feeSchedule.scope != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.scope}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.feeSchedule.enumerators.scope,
                  feeSchedule.scope,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.feeSchedule.enumerators.scope,
                  feeSchedule.scope,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {feeSchedule.makerFeeBps != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.makerFeeBps}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{feeSchedule.makerFeeBps}</span>
              <CopyToClipboardButton
                text={feeSchedule.makerFeeBps.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {feeSchedule.takerFeeBps != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.takerFeeBps}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{feeSchedule.takerFeeBps}</span>
              <CopyToClipboardButton
                text={feeSchedule.takerFeeBps.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {feeSchedule.minFeeAmount != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.minFeeAmount}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(feeSchedule.minFeeAmount?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  feeSchedule.minFeeAmount?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {feeSchedule.effectiveFrom != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.effectiveFrom}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(feeSchedule.effectiveFrom, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(feeSchedule.effectiveFrom, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {feeSchedule.effectiveTo != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.effectiveTo}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(feeSchedule.effectiveTo, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(feeSchedule.effectiveTo, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(feeSchedule.tier) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.tier}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{feeSchedule.tier}</span>
              <CopyToClipboardButton
                text={feeSchedule.tier}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(feeSchedule.accountId) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.accountId}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{feeSchedule.accountId}</span>
              <CopyToClipboardButton
                text={feeSchedule.accountId}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(feeSchedule.instrumentId) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.instrumentId}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{feeSchedule.instrumentId}</span>
              <CopyToClipboardButton
                text={feeSchedule.instrumentId}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feeSchedule.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={feeSchedule.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  feeSchedule.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feeSchedule.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(feeSchedule.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(feeSchedule.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feeSchedule.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={feeSchedule.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  feeSchedule.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feeSchedule.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(feeSchedule.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(feeSchedule.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feeSchedule.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={feeSchedule.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  feeSchedule.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feeSchedule.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feeSchedule.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(feeSchedule.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(feeSchedule.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
