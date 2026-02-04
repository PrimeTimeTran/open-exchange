import { Article } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function articleLabel(article?: Partial<Article> | null, dictionary?: Dictionary) {
  const label = String(article?.id != null ? article.id : '');

  if (!article?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
