import { Asset } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function assetLabel(asset?: Partial<Asset> | null, dictionary?: Dictionary) {
  const label = String(asset?.symbol != null ? asset.symbol : '');

  if (!asset?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
