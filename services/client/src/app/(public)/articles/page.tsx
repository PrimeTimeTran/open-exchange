import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllArticles } from '@/lib/articles';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export const metadata = {
  title: 'Market Architecture - Articles',
  description:
    'Deep dives into the engineering, economics, and philosophy behind Open Exchanges.',
};

export default function ArticlesIndex() {
  const articles = getAllArticles();

  // Sort articles by date descending
  const sortedArticles = articles.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent pb-2">
          Market Architecture
        </h1>
        <p className="text-lg text-muted-foreground">
          Deep dives into the engineering, economics, and philosophy behind Open
          Exchanges.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group relative block h-full"
          >
            <SpotlightCard className="h-full bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
              <div className="flex flex-col h-full relative z-10">
                <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                  {article.date && (
                    <time dateTime={article.date}>
                      {new Date(article.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                  {article.series && (
                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium truncate max-w-[120px]">
                      {article.series}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-colors">
                  {article.title}
                </h2>

                {article.description && (
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                    {article.description}
                  </p>
                )}

                <div className="flex items-center text-primary text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform">
                  Read article <ArrowRight className="ml-1 w-4 h-4" />
                </div>
              </div>
            </SpotlightCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
