'use client';

import { Feedback } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FeedbackForm } from 'src/features/feedback/components/FeedbackForm';
import { feedbackFindApiCall } from 'src/features/feedback/feedbackApiCalls';
import { feedbackLabel } from 'src/features/feedback/feedbackLabel';
import { FeedbackWithRelationships } from 'src/features/feedback/feedbackSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function FeedbackEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setFeedback(undefined);
        const feedback = await feedbackFindApiCall(id);

        if (!feedback) {
          router.push('/feedback');
        }

        setFeedback(feedback);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/feedback');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!feedback) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.feedback.list.menu, '/feedback'],
          [feedbackLabel(feedback, context.dictionary), `/feedback/${feedback?.id}`],
          [dictionary.feedback.edit.menu],
        ]}
      />
      <div className="my-10">
        <FeedbackForm
          context={context}
          feedback={feedback}
          onSuccess={(feedback: Feedback) => router.push(`/feedback/${feedback.id}`)}
          onCancel={() => router.push('/feedback')}
        />
      </div>
    </div>
  );
}
