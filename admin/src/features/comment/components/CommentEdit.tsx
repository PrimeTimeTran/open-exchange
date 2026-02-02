'use client';

import { Comment } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CommentForm } from 'src/features/comment/components/CommentForm';
import { commentFindApiCall } from 'src/features/comment/commentApiCalls';
import { commentLabel } from 'src/features/comment/commentLabel';
import { CommentWithRelationships } from 'src/features/comment/commentSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function CommentEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [comment, setComment] = useState<CommentWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setComment(undefined);
        const comment = await commentFindApiCall(id);

        if (!comment) {
          router.push('/comment');
        }

        setComment(comment);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/comment');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!comment) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.comment.list.menu, '/comment'],
          [commentLabel(comment, context.dictionary), `/comment/${comment?.id}`],
          [dictionary.comment.edit.menu],
        ]}
      />
      <div className="my-10">
        <CommentForm
          context={context}
          comment={comment}
          onSuccess={(comment: Comment) => router.push(`/comment/${comment.id}`)}
          onCancel={() => router.push('/comment')}
        />
      </div>
    </div>
  );
}
