'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { BalanceSnapshotWithRelationships } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { balanceSnapshotFindApiCall } from 'src/features/balanceSnapshot/balanceSnapshotApiCalls';
import { BalanceSnapshotActions } from 'src/features/balanceSnapshot/components/BalanceSnapshotActions';
import { balanceSnapshotPermissions } from 'src/features/balanceSnapshot/balanceSnapshotPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { accountLabel } from 'src/features/account/accountLabel';
import { AccountLink } from 'src/features/account/components/AccountLink';
import { walletLabel } from 'src/features/wallet/walletLabel';
import { WalletLink } from 'src/features/wallet/components/WalletLink';
import { assetLabel } from 'src/features/asset/assetLabel';
import { AssetLink } from 'src/features/asset/components/AssetLink';
import { balanceSnapshotLabel } from 'src/features/balanceSnapshot/balanceSnapshotLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function BalanceSnapshotView({
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
    queryKey: ['balanceSnapshot', id],
    queryFn: async ({ signal }) => {
      return await balanceSnapshotFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'balanceSnapshot',
        ]) as Array<BalanceSnapshotWithRelationships>
      )?.find((d) => d.id === id),
  });

  const balanceSnapshot = query.data;

  if (query.isSuccess && !balanceSnapshot) {
    router.push('/balance-snapshot');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/balance-snapshot');
    return null;
  }

  if (!balanceSnapshot) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.balanceSnapshot.list.menu, '/balance-snapshot'],
            [balanceSnapshotLabel(balanceSnapshot, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <BalanceSnapshotActions mode="view" balanceSnapshot={balanceSnapshot} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {balanceSnapshot.available != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.available}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(balanceSnapshot.available?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  balanceSnapshot.available?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {balanceSnapshot.locked != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.locked}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(balanceSnapshot.locked?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  balanceSnapshot.locked?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {balanceSnapshot.total != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.total}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(balanceSnapshot.total?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  balanceSnapshot.total?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {balanceSnapshot.snapshotAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.snapshotAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(balanceSnapshot.snapshotAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(balanceSnapshot.snapshotAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {balanceSnapshot.account != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.account}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <AccountLink account={balanceSnapshot.account} context={context} />
              <CopyToClipboardButton
                text={accountLabel(balanceSnapshot.account, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {balanceSnapshot.wallet != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.wallet}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <WalletLink wallet={balanceSnapshot.wallet} context={context} />
              <CopyToClipboardButton
                text={walletLabel(balanceSnapshot.wallet, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {balanceSnapshot.asset != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.asset}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <AssetLink asset={balanceSnapshot.asset} context={context} />
              <CopyToClipboardButton
                text={assetLabel(balanceSnapshot.asset, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {balanceSnapshot.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={balanceSnapshot.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  balanceSnapshot.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {balanceSnapshot.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(balanceSnapshot.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(balanceSnapshot.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {balanceSnapshot.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={balanceSnapshot.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  balanceSnapshot.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {balanceSnapshot.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(balanceSnapshot.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(balanceSnapshot.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {balanceSnapshot.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={balanceSnapshot.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  balanceSnapshot.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {balanceSnapshot.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.balanceSnapshot.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(balanceSnapshot.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(balanceSnapshot.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
