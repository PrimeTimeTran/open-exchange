'use client';

import { Feedback } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FeedbackForm } from 'src/features/feedback/components/FeedbackForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function FeedbackNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <FeedbackForm
      context={context}
      onSuccess={(feedback: Feedback) =>
        router.push(`/feedback/${feedback.id}`)
      }
      onCancel={() => router.push('/feedback')}
    />
  );
}
