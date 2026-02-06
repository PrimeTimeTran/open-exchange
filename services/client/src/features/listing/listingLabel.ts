import { Listing } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function listingLabel(listing?: Partial<Listing> | null, dictionary?: Dictionary) {
  const label = String(listing?.assetSymbol != null ? listing.assetSymbol : '');

  if (!listing?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
