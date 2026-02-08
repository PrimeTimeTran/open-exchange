'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { WalletWithRelationships } from 'src/features/wallet/walletSchemas';
import { walletFindApiCall } from 'src/features/wallet/walletApiCalls';
import { WalletActions } from 'src/features/wallet/components/WalletActions';
import { walletPermissions } from 'src/features/wallet/walletPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { assetLabel } from 'src/features/asset/assetLabel';
import { AssetLink } from 'src/features/asset/components/AssetLink';
import { accountLabel } from 'src/features/account/accountLabel';
import { AccountLink } from 'src/features/account/components/AccountLink';
import { balanceSnapshotLabel } from 'src/features/balanceSnapshot/balanceSnapshotLabel';
import { BalanceSnapshotLink } from 'src/features/balanceSnapshot/components/BalanceSnapshotLink';
import { walletLabel } from 'src/features/wallet/walletLabel';

export function WalletView({
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
    queryKey: ['wallet', id],
    queryFn: async ({ signal }) => {
      return await walletFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'wallet',
        ]) as Array<WalletWithRelationships>
      )?.find((d) => d.id === id),
  });

  const wallet = query.data;

  if (query.isSuccess && !wallet) {
    router.push('/wallet');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/wallet');
    return null;
  }

  if (!wallet) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.wallet.list.menu, '/wallet'],
            [walletLabel(wallet, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <WalletActions mode="view" wallet={wallet} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {wallet.available != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.available}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(wallet.available?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  wallet.available?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {wallet.locked != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.locked}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(wallet.locked?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  wallet.locked?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {wallet.total != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.total}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(wallet.total?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  wallet.total?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {wallet.version != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.version}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{wallet.version}</span>
              <CopyToClipboardButton
                text={wallet.version.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {wallet.user != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.user}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink membership={wallet.user} context={context} />
              <CopyToClipboardButton
                text={membershipLabel(wallet.user, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {wallet.asset != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.asset}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <AssetLink asset={wallet.asset} context={context} />
              <CopyToClipboardButton
                text={assetLabel(wallet.asset, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {wallet.account != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.account}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <AccountLink account={wallet.account} context={context} />
              <CopyToClipboardButton
                text={accountLabel(wallet.account, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {wallet.snapshots?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.wallet.fields.snapshots}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {wallet.snapshots?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <BalanceSnapshotLink
                    balanceSnapshot={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={balanceSnapshotLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}

        {wallet.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={wallet.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  wallet.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {wallet.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(wallet.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(wallet.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {wallet.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={wallet.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  wallet.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {wallet.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(wallet.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(wallet.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {wallet.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={wallet.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  wallet.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {wallet.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.wallet.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(wallet.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(wallet.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
