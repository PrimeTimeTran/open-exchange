'use client';

import { Deposit } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DepositForm } from 'src/features/deposit/components/DepositForm';
import { depositFindApiCall } from 'src/features/deposit/depositApiCalls';
import { depositLabel } from 'src/features/deposit/depositLabel';
import { DepositWithRelationships } from 'src/features/deposit/depositSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function DepositEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [deposit, setDeposit] = useState<DepositWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setDeposit(undefined);
        const deposit = await depositFindApiCall(id);

        if (!deposit) {
          router.push('/deposit');
        }

        setDeposit(deposit);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/deposit');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!deposit) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.deposit.list.menu, '/deposit'],
          [depositLabel(deposit, context.dictionary), `/deposit/${deposit?.id}`],
          [dictionary.deposit.edit.menu],
        ]}
      />
      <div className="my-10">
        <DepositForm
          context={context}
          deposit={deposit}
          onSuccess={(deposit: Deposit) => router.push(`/deposit/${deposit.id}`)}
          onCancel={() => router.push('/deposit')}
        />
      </div>
    </div>
  );
}
