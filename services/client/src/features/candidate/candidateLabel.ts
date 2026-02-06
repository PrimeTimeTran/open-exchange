import { Candidate } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function candidateLabel(candidate?: Partial<Candidate> | null, dictionary?: Dictionary) {
  const label = String(candidate?.email != null ? candidate.email : '');

  if (!candidate?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
