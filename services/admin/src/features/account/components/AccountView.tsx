'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AccountWithRelationships } from 'src/features/account/accountSchemas';
import { accountFindApiCall } from 'src/features/account/accountApiCalls';
import { AccountActions } from 'src/features/account/components/AccountActions';
import { accountPermissions } from 'src/features/account/accountPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { orderLabel } from 'src/features/order/orderLabel';
import { OrderLink } from 'src/features/order/components/OrderLink';
import { walletLabel } from 'src/features/wallet/walletLabel';
import { WalletLink } from 'src/features/wallet/components/WalletLink';
import { depositLabel } from 'src/features/deposit/depositLabel';
import { DepositLink } from 'src/features/deposit/components/DepositLink';
import { withdrawalLabel } from 'src/features/withdrawal/withdrawalLabel';
import { WithdrawalLink } from 'src/features/withdrawal/components/WithdrawalLink';
import { balanceSnapshotLabel } from 'src/features/balanceSnapshot/balanceSnapshotLabel';
import { BalanceSnapshotLink } from 'src/features/balanceSnapshot/components/BalanceSnapshotLink';
import { accountLabel } from 'src/features/account/accountLabel';

export function AccountView({
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
    queryKey: ['account', id],
    queryFn: async ({ signal }) => {
      return await accountFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'account',
        ]) as Array<AccountWithRelationships>
      )?.find((d) => d.id === id),
  });

  const account = query.data;

  if (query.isSuccess && !account) {
    router.push('/account');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/account');
    return null;
  }

  if (!account) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.account.list.menu, '/account'],
            [accountLabel(account, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <AccountActions mode="view" account={account} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {account.type != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.account.fields.type}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.account.enumerators.type,
                  account.type,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.account.enumerators.type,
                  account.type,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {account.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.account.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.account.enumerators.status,
                  account.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.account.enumerators.status,
                  account.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {account.orders?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.account.fields.orders}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {account.orders?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <OrderLink
                    order={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={orderLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {account.wallets?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.account.fields.wallets}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {account.wallets?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <WalletLink
                    wallet={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={walletLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {account.user != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.account.fields.user}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink membership={account.user} context={context} />
              <CopyToClipboardButton
                text={membershipLabel(account.user, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {account.deposits?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.account.fields.deposits}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {account.deposits?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <DepositLink
                    deposit={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={depositLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {account.withdrawals?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.account.fields.withdrawals}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {account.withdrawals?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <WithdrawalLink
                    withdrawal={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={withdrawalLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {account.snapshots?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.account.fields.snapshots}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {account.snapshots?.map((item) => {
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

        {account.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.account.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={account.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  account.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {account.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.account.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(account.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(account.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {account.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.account.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={account.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  account.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {account.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.account.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(account.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(account.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {account.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.account.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={account.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  account.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {account.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.account.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(account.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(account.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
