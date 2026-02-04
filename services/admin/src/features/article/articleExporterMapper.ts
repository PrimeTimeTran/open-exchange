import { ArticleWithRelationships } from 'src/features/article/articleSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function articleExporterMapper(
  articles: ArticleWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return articles.map((article) => {
    return {
      id: article.id,
      user: membershipLabel(article.user, context.dictionary),
      title: article.title,
      body: article.body,
      type: article.type?.join(', '),
      meta: article.meta?.toString(),
      createdByMembership: membershipLabel(article.createdByMembership, context.dictionary),
      createdAt: String(article.createdAt),
      updatedByMembership: membershipLabel(article.createdByMembership, context.dictionary),
      updatedAt: String(article.updatedAt),
      archivedByMembership: membershipLabel(
        article.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(article.archivedAt),
    };
  });
}
