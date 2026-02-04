'use client';

import { FeeSchedule } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FeeScheduleForm } from 'src/features/feeSchedule/components/FeeScheduleForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function FeeScheduleNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <FeeScheduleForm
      context={context}
      onSuccess={(feeSchedule: FeeSchedule) =>
        router.push(`/fee-schedule/${feeSchedule.id}`)
      }
      onCancel={() => router.push('/fee-schedule')}
    />
  );
}
