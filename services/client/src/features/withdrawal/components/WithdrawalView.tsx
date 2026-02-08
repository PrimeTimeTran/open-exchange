'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { WithdrawalWithRelationships } from 'src/features/withdrawal/withdrawalSchemas';
import { withdrawalFindApiCall } from 'src/features/withdrawal/withdrawalApiCalls';
import { WithdrawalActions } from 'src/features/withdrawal/components/WithdrawalActions';
import { withdrawalPermissions } from 'src/features/withdrawal/withdrawalPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { accountLabel } from 'src/features/account/accountLabel';
import { AccountLink } from 'src/features/account/components/AccountLink';
import { assetLabel } from 'src/features/asset/assetLabel';
import { AssetLink } from 'src/features/asset/components/AssetLink';
import { withdrawalLabel } from 'src/features/withdrawal/withdrawalLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function WithdrawalView({
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
    queryKey: ['withdrawal', id],
    queryFn: async ({ signal }) => {
      return await withdrawalFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'withdrawal',
        ]) as Array<WithdrawalWithRelationships>
      )?.find((d) => d.id === id),
  });

  const withdrawal = query.data;

  if (query.isSuccess && !withdrawal) {
    router.push('/withdrawal');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/withdrawal');
    return null;
  }

  if (!withdrawal) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.withdrawal.list.menu, '/withdrawal'],
            [withdrawalLabel(withdrawal, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <WithdrawalActions mode="view" withdrawal={withdrawal} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {withdrawal.amount != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.amount}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(withdrawal.amount?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  withdrawal.amount?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {withdrawal.fee != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.fee}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(withdrawal.fee?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  withdrawal.fee?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {withdrawal.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.withdrawal.enumerators.status,
                  withdrawal.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.withdrawal.enumerators.status,
                  withdrawal.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(withdrawal.destinationAddress) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.destinationAddress}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{withdrawal.destinationAddress}</span>
              <CopyToClipboardButton
                text={withdrawal.destinationAddress}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(withdrawal.destinationTag) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.destinationTag}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{withdrawal.destinationTag}</span>
              <CopyToClipboardButton
                text={withdrawal.destinationTag}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(withdrawal.chain) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.chain}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{withdrawal.chain}</span>
              <CopyToClipboardButton
                text={withdrawal.chain}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(withdrawal.txHash) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.txHash}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{withdrawal.txHash}</span>
              <CopyToClipboardButton
                text={withdrawal.txHash}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(withdrawal.failureReason) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.failureReason}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{withdrawal.failureReason}</span>
              <CopyToClipboardButton
                text={withdrawal.failureReason}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(withdrawal.requestedBy) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.requestedBy}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{withdrawal.requestedBy}</span>
              <CopyToClipboardButton
                text={withdrawal.requestedBy}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(withdrawal.approvedBy) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.approvedBy}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{withdrawal.approvedBy}</span>
              <CopyToClipboardButton
                text={withdrawal.approvedBy}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {withdrawal.approvedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.approvedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(withdrawal.approvedAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(withdrawal.approvedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {withdrawal.requestedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.requestedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(withdrawal.requestedAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(withdrawal.requestedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {withdrawal.broadcastAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.broadcastAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(withdrawal.broadcastAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(withdrawal.broadcastAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {withdrawal.confirmedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.confirmedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(withdrawal.confirmedAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(withdrawal.confirmedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {withdrawal.confirmations != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.confirmations}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{withdrawal.confirmations}</span>
              <CopyToClipboardButton
                text={withdrawal.confirmations.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {withdrawal.account != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.account}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <AccountLink account={withdrawal.account} context={context} />
              <CopyToClipboardButton
                text={accountLabel(withdrawal.account, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {withdrawal.asset != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.asset}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <AssetLink asset={withdrawal.asset} context={context} />
              <CopyToClipboardButton
                text={assetLabel(withdrawal.asset, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {withdrawal.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={withdrawal.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  withdrawal.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {withdrawal.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(withdrawal.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(withdrawal.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {withdrawal.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={withdrawal.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  withdrawal.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {withdrawal.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(withdrawal.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(withdrawal.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {withdrawal.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={withdrawal.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  withdrawal.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {withdrawal.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.withdrawal.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(withdrawal.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(withdrawal.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
