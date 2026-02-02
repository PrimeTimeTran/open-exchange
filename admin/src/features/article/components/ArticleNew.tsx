'use client';

import { Article } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ArticleForm } from 'src/features/article/components/ArticleForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function ArticleNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <ArticleForm
      context={context}
      onSuccess={(article: Article) =>
        router.push(`/article/${article.id}`)
      }
      onCancel={() => router.push('/article')}
    />
  );
}
