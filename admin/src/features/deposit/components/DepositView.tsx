'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { DepositWithRelationships } from 'src/features/deposit/depositSchemas';
import { depositFindApiCall } from 'src/features/deposit/depositApiCalls';
import { DepositActions } from 'src/features/deposit/components/DepositActions';
import { depositPermissions } from 'src/features/deposit/depositPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { accountLabel } from 'src/features/account/accountLabel';
import { AccountLink } from 'src/features/account/components/AccountLink';
import { assetLabel } from 'src/features/asset/assetLabel';
import { AssetLink } from 'src/features/asset/components/AssetLink';
import { depositLabel } from 'src/features/deposit/depositLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function DepositView({
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
    queryKey: ['deposit', id],
    queryFn: async ({ signal }) => {
      return await depositFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'deposit',
        ]) as Array<DepositWithRelationships>
      )?.find((d) => d.id === id),
  });

  const deposit = query.data;

  if (query.isSuccess && !deposit) {
    router.push('/deposit');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/deposit');
    return null;
  }

  if (!deposit) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.deposit.list.menu, '/deposit'],
            [depositLabel(deposit, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <DepositActions mode="view" deposit={deposit} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {deposit.amount != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.amount}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{deposit.amount}</span>
              <CopyToClipboardButton
                text={deposit.amount.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {deposit.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.deposit.enumerators.status,
                  deposit.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.deposit.enumerators.status,
                  deposit.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(deposit.chain) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.chain}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{deposit.chain}</span>
              <CopyToClipboardButton
                text={deposit.chain}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(deposit.txHash) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.txHash}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{deposit.txHash}</span>
              <CopyToClipboardButton
                text={deposit.txHash}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(deposit.fromAddress) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.fromAddress}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{deposit.fromAddress}</span>
              <CopyToClipboardButton
                text={deposit.fromAddress}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {deposit.confirmations != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.confirmations}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{deposit.confirmations}</span>
              <CopyToClipboardButton
                text={deposit.confirmations.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {deposit.requiredConfirmations != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.requiredConfirmations}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{deposit.requiredConfirmations}</span>
              <CopyToClipboardButton
                text={deposit.requiredConfirmations.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {deposit.detectedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.detectedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(deposit.detectedAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(deposit.detectedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {deposit.confirmedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.confirmedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(deposit.confirmedAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(deposit.confirmedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {deposit.creditedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.creditedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(deposit.creditedAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(deposit.creditedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {deposit.account != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.account}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <AccountLink account={deposit.account} context={context} />
              <CopyToClipboardButton
                text={accountLabel(deposit.account, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {deposit.asset != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.asset}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <AssetLink asset={deposit.asset} context={context} />
              <CopyToClipboardButton
                text={assetLabel(deposit.asset, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {deposit.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={deposit.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  deposit.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {deposit.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(deposit.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(deposit.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {deposit.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={deposit.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  deposit.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {deposit.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(deposit.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(deposit.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {deposit.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={deposit.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  deposit.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {deposit.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.deposit.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(deposit.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(deposit.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
