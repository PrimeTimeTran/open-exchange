'use client';

import { Candidate } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CandidateForm } from 'src/features/candidate/components/CandidateForm';
import { candidateFindApiCall } from 'src/features/candidate/candidateApiCalls';
import { candidateLabel } from 'src/features/candidate/candidateLabel';
import { CandidateWithRelationships } from 'src/features/candidate/candidateSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function CandidateEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setCandidate(undefined);
        const candidate = await candidateFindApiCall(id);

        if (!candidate) {
          router.push('/candidate');
        }

        setCandidate(candidate);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/candidate');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!candidate) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.candidate.list.menu, '/candidate'],
          [candidateLabel(candidate, context.dictionary), `/candidate/${candidate?.id}`],
          [dictionary.candidate.edit.menu],
        ]}
      />
      <div className="my-10">
        <CandidateForm
          context={context}
          candidate={candidate}
          onSuccess={(candidate: Candidate) => router.push(`/candidate/${candidate.id}`)}
          onCancel={() => router.push('/candidate')}
        />
      </div>
    </div>
  );
}
