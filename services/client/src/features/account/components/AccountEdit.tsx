'use client';

import { Account } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AccountForm } from 'src/features/account/components/AccountForm';
import { accountFindApiCall } from 'src/features/account/accountApiCalls';
import { accountLabel } from 'src/features/account/accountLabel';
import { AccountWithRelationships } from 'src/features/account/accountSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function AccountEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [account, setAccount] = useState<AccountWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setAccount(undefined);
        const account = await accountFindApiCall(id);

        if (!account) {
          router.push('/account');
        }

        setAccount(account);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/account');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!account) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.account.list.menu, '/account'],
          [accountLabel(account, context.dictionary), `/account/${account?.id}`],
          [dictionary.account.edit.menu],
        ]}
      />
      <div className="my-10">
        <AccountForm
          context={context}
          account={account}
          onSuccess={(account: Account) => router.push(`/account/${account.id}`)}
          onCancel={() => router.push('/account')}
        />
      </div>
    </div>
  );
}
