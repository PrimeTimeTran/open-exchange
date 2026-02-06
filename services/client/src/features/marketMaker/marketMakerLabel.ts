import { MarketMaker } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function marketMakerLabel(marketMaker?: Partial<MarketMaker> | null, dictionary?: Dictionary) {
  const label = String(marketMaker?.organizationName != null ? marketMaker.organizationName : '');

  if (!marketMaker?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
