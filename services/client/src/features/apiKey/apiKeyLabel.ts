import { ApiKey } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';

export function apiKeyLabel(
  apiKey?: Partial<ApiKey> | null,
  dictionary?: Dictionary,
) {
  return apiKey?.name || '';
}
