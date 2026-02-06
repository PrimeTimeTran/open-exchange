import { Comment } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function commentLabel(comment?: Partial<Comment> | null, dictionary?: Dictionary) {
  const label = String(comment?.id != null ? comment.id : '');

  if (!comment?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
