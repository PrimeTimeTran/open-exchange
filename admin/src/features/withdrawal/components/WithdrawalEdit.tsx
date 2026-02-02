'use client';

import { Withdrawal } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WithdrawalForm } from 'src/features/withdrawal/components/WithdrawalForm';
import { withdrawalFindApiCall } from 'src/features/withdrawal/withdrawalApiCalls';
import { withdrawalLabel } from 'src/features/withdrawal/withdrawalLabel';
import { WithdrawalWithRelationships } from 'src/features/withdrawal/withdrawalSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function WithdrawalEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [withdrawal, setWithdrawal] = useState<WithdrawalWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setWithdrawal(undefined);
        const withdrawal = await withdrawalFindApiCall(id);

        if (!withdrawal) {
          router.push('/withdrawal');
        }

        setWithdrawal(withdrawal);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/withdrawal');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!withdrawal) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.withdrawal.list.menu, '/withdrawal'],
          [withdrawalLabel(withdrawal, context.dictionary), `/withdrawal/${withdrawal?.id}`],
          [dictionary.withdrawal.edit.menu],
        ]}
      />
      <div className="my-10">
        <WithdrawalForm
          context={context}
          withdrawal={withdrawal}
          onSuccess={(withdrawal: Withdrawal) => router.push(`/withdrawal/${withdrawal.id}`)}
          onCancel={() => router.push('/withdrawal')}
        />
      </div>
    </div>
  );
}
