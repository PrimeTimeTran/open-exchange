'use client';

import { Post } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { PostForm } from 'src/features/post/components/PostForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function PostNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <PostForm
      context={context}
      onSuccess={(post: Post) =>
        router.push(`/post/${post.id}`)
      }
      onCancel={() => router.push('/post')}
    />
  );
}
