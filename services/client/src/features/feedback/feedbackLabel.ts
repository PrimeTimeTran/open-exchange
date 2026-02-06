import { Feedback } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function feedbackLabel(feedback?: Partial<Feedback> | null, dictionary?: Dictionary) {
  const label = String(feedback?.id != null ? feedback.id : '');

  if (!feedback?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
