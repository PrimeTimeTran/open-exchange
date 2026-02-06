import { Job } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function jobLabel(job?: Partial<Job> | null, dictionary?: Dictionary) {
  const label = String(job?.id != null ? job.id : '');

  if (!job?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
