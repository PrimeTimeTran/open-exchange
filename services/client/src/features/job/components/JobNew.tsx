'use client';

import { Job } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { JobForm } from 'src/features/job/components/JobForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function JobNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <JobForm
      context={context}
      onSuccess={(job: Job) =>
        router.push(`/job/${job.id}`)
      }
      onCancel={() => router.push('/job')}
    />
  );
}
