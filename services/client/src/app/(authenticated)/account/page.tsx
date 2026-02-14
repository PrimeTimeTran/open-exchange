import React from 'react';
import { cookies } from 'next/headers';
import { AccountClient } from './account-client';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getAccountPageData } from './account.service';

export default async function AccountPage() {
  const context = await appContextForReact(cookies());

  if (!context.currentMembership || !context.currentTenant) {
    console.log({
      membership: context.dictionary.membership,
      tenant: context.dictionary.tenant,
    });
    return null;
  }

  const { balances, orders, deposits, withdrawals, availableAssets } =
    await getAccountPageData(context);

  return (
    <AccountClient
      orders={orders}
      balances={balances}
      deposits={deposits}
      assets={availableAssets}
      withdrawals={withdrawals}
    />
  );
}
