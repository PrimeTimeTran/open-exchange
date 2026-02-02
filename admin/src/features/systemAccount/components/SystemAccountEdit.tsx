'use client';

import { SystemAccount } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SystemAccountForm } from 'src/features/systemAccount/components/SystemAccountForm';
import { systemAccountFindApiCall } from 'src/features/systemAccount/systemAccountApiCalls';
import { systemAccountLabel } from 'src/features/systemAccount/systemAccountLabel';
import { SystemAccountWithRelationships } from 'src/features/systemAccount/systemAccountSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function SystemAccountEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [systemAccount, setSystemAccount] = useState<SystemAccountWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setSystemAccount(undefined);
        const systemAccount = await systemAccountFindApiCall(id);

        if (!systemAccount) {
          router.push('/system-account');
        }

        setSystemAccount(systemAccount);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/system-account');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!systemAccount) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.systemAccount.list.menu, '/system-account'],
          [systemAccountLabel(systemAccount, context.dictionary), `/system-account/${systemAccount?.id}`],
          [dictionary.systemAccount.edit.menu],
        ]}
      />
      <div className="my-10">
        <SystemAccountForm
          context={context}
          systemAccount={systemAccount}
          onSuccess={(systemAccount: SystemAccount) => router.push(`/system-account/${systemAccount.id}`)}
          onCancel={() => router.push('/system-account')}
        />
      </div>
    </div>
  );
}
