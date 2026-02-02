'use client';

import { Comment } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { CommentForm } from 'src/features/comment/components/CommentForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function CommentNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <CommentForm
      context={context}
      onSuccess={(comment: Comment) =>
        router.push(`/comment/${comment.id}`)
      }
      onCancel={() => router.push('/comment')}
    />
  );
}
