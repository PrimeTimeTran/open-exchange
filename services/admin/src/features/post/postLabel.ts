import { Post } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function postLabel(post?: Partial<Post> | null, dictionary?: Dictionary) {
  const label = String(post?.id != null ? post.id : '');

  if (!post?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
