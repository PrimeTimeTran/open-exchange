'use client';

import { FeeSchedule } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FeeScheduleForm } from 'src/features/feeSchedule/components/FeeScheduleForm';
import { feeScheduleFindApiCall } from 'src/features/feeSchedule/feeScheduleApiCalls';
import { feeScheduleLabel } from 'src/features/feeSchedule/feeScheduleLabel';
import { FeeScheduleWithRelationships } from 'src/features/feeSchedule/feeScheduleSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function FeeScheduleEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [feeSchedule, setFeeSchedule] = useState<FeeScheduleWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setFeeSchedule(undefined);
        const feeSchedule = await feeScheduleFindApiCall(id);

        if (!feeSchedule) {
          router.push('/fee-schedule');
        }

        setFeeSchedule(feeSchedule);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/fee-schedule');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!feeSchedule) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.feeSchedule.list.menu, '/fee-schedule'],
          [feeScheduleLabel(feeSchedule, context.dictionary), `/fee-schedule/${feeSchedule?.id}`],
          [dictionary.feeSchedule.edit.menu],
        ]}
      />
      <div className="my-10">
        <FeeScheduleForm
          context={context}
          feeSchedule={feeSchedule}
          onSuccess={(feeSchedule: FeeSchedule) => router.push(`/fee-schedule/${feeSchedule.id}`)}
          onCancel={() => router.push('/fee-schedule')}
        />
      </div>
    </div>
  );
}
