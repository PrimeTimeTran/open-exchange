'use client';

import { Candidate } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { CandidateForm } from 'src/features/candidate/components/CandidateForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function CandidateNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <CandidateForm
      context={context}
      onSuccess={(candidate: Candidate) =>
        router.push(`/candidate/${candidate.id}`)
      }
      onCancel={() => router.push('/candidate')}
    />
  );
}
