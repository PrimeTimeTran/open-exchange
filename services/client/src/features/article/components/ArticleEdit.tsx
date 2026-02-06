'use client';

import { Article } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArticleForm } from 'src/features/article/components/ArticleForm';
import { articleFindApiCall } from 'src/features/article/articleApiCalls';
import { articleLabel } from 'src/features/article/articleLabel';
import { ArticleWithRelationships } from 'src/features/article/articleSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function ArticleEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [article, setArticle] = useState<ArticleWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setArticle(undefined);
        const article = await articleFindApiCall(id);

        if (!article) {
          router.push('/article');
        }

        setArticle(article);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/article');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!article) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.article.list.menu, '/article'],
          [articleLabel(article, context.dictionary), `/article/${article?.id}`],
          [dictionary.article.edit.menu],
        ]}
      />
      <div className="my-10">
        <ArticleForm
          context={context}
          article={article}
          onSuccess={(article: Article) => router.push(`/article/${article.id}`)}
          onCancel={() => router.push('/article')}
        />
      </div>
    </div>
  );
}
