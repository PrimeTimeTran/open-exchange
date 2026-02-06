'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ReferralWithRelationships } from 'src/features/referral/referralSchemas';
import { referralFindApiCall } from 'src/features/referral/referralApiCalls';
import { ReferralActions } from 'src/features/referral/components/ReferralActions';
import { referralPermissions } from 'src/features/referral/referralPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { referralLabel } from 'src/features/referral/referralLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function ReferralView({
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
    queryKey: ['referral', id],
    queryFn: async ({ signal }) => {
      return await referralFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'referral',
        ]) as Array<ReferralWithRelationships>
      )?.find((d) => d.id === id),
  });

  const referral = query.data;

  if (query.isSuccess && !referral) {
    router.push('/referral');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/referral');
    return null;
  }

  if (!referral) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.referral.list.menu, '/referral'],
            [referralLabel(referral, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <ReferralActions mode="view" referral={referral} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(referral.referrerUserId) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.referrerUserId}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{referral.referrerUserId}</span>
              <CopyToClipboardButton
                text={referral.referrerUserId}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(referral.referredUserId) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.referredUserId}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{referral.referredUserId}</span>
              <CopyToClipboardButton
                text={referral.referredUserId}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(referral.referralCode) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.referralCode}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{referral.referralCode}</span>
              <CopyToClipboardButton
                text={referral.referralCode}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {referral.source != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.source}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.referral.enumerators.source,
                  referral.source,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.referral.enumerators.source,
                  referral.source,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {referral.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.referral.enumerators.status,
                  referral.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.referral.enumerators.status,
                  referral.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {referral.rewardType != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.rewardType}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.referral.enumerators.rewardType,
                  referral.rewardType,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.referral.enumerators.rewardType,
                  referral.rewardType,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {referral.rewardAmount != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.rewardAmount}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{referral.rewardAmount}</span>
              <CopyToClipboardButton
                text={referral.rewardAmount.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(referral.rewardCurrency) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.rewardCurrency}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{referral.rewardCurrency}</span>
              <CopyToClipboardButton
                text={referral.rewardCurrency}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {referral.rewardedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.rewardedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(referral.rewardedAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(referral.rewardedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {referral.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={referral.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  referral.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {referral.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(referral.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(referral.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {referral.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={referral.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  referral.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {referral.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(referral.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(referral.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {referral.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={referral.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  referral.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {referral.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.referral.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(referral.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(referral.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
