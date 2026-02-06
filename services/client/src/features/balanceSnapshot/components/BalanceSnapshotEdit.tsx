'use client';

import { BalanceSnapshot } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BalanceSnapshotForm } from 'src/features/balanceSnapshot/components/BalanceSnapshotForm';
import { balanceSnapshotFindApiCall } from 'src/features/balanceSnapshot/balanceSnapshotApiCalls';
import { balanceSnapshotLabel } from 'src/features/balanceSnapshot/balanceSnapshotLabel';
import { BalanceSnapshotWithRelationships } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function BalanceSnapshotEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [balanceSnapshot, setBalanceSnapshot] = useState<BalanceSnapshotWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setBalanceSnapshot(undefined);
        const balanceSnapshot = await balanceSnapshotFindApiCall(id);

        if (!balanceSnapshot) {
          router.push('/balance-snapshot');
        }

        setBalanceSnapshot(balanceSnapshot);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/balance-snapshot');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!balanceSnapshot) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.balanceSnapshot.list.menu, '/balance-snapshot'],
          [balanceSnapshotLabel(balanceSnapshot, context.dictionary), `/balance-snapshot/${balanceSnapshot?.id}`],
          [dictionary.balanceSnapshot.edit.menu],
        ]}
      />
      <div className="my-10">
        <BalanceSnapshotForm
          context={context}
          balanceSnapshot={balanceSnapshot}
          onSuccess={(balanceSnapshot: BalanceSnapshot) => router.push(`/balance-snapshot/${balanceSnapshot.id}`)}
          onCancel={() => router.push('/balance-snapshot')}
        />
      </div>
    </div>
  );
}
