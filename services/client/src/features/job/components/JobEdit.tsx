'use client';

import { Job } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { JobForm } from 'src/features/job/components/JobForm';
import { jobFindApiCall } from 'src/features/job/jobApiCalls';
import { jobLabel } from 'src/features/job/jobLabel';
import { JobWithRelationships } from 'src/features/job/jobSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function JobEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [job, setJob] = useState<JobWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setJob(undefined);
        const job = await jobFindApiCall(id);

        if (!job) {
          router.push('/job');
        }

        setJob(job);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/job');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!job) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.job.list.menu, '/job'],
          [jobLabel(job, context.dictionary), `/job/${job?.id}`],
          [dictionary.job.edit.menu],
        ]}
      />
      <div className="my-10">
        <JobForm
          context={context}
          job={job}
          onSuccess={(job: Job) => router.push(`/job/${job.id}`)}
          onCancel={() => router.push('/job')}
        />
      </div>
    </div>
  );
}
