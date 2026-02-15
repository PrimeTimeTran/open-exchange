import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { getArticleBySlug } from '@/lib/articles';
import { MdxComponents } from '@/components/mdx/mdx-components';

type Props = {
  params: { slug: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.meta.title,
    description: article.meta.description,
  };
}

export default function ArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
      <article className="mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl mb-4">
            {article.meta.title}
          </h1>
          {article.meta.description && (
            <p className="text-xl text-muted-foreground">
              {article.meta.description}
            </p>
          )}
          {article.meta.date && (
            <div className="mt-4 text-sm text-muted-foreground">
              <time dateTime={article.meta.date}>
                {new Date(article.meta.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          )}
        </header>
        <div className="mt-8">
          <MDXRemote source={article.content} components={MdxComponents} />
        </div>
      </article>
    </div>
  );
}
