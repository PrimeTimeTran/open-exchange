import { AssetWithRelationships } from 'src/features/asset/assetSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function assetExporterMapper(
  assets: AssetWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return assets.map((asset) => {
    return {
      id: asset.id,
      symbol: asset.symbol,
      klass: enumeratorLabel(
        context.dictionary.asset.enumerators.klass,
        asset.klass,
      ),
      precision: asset.precision?.toString(),
      isFractional: asset.isFractional
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      decimals: asset.decimals?.toString(),
      meta: asset.meta?.toString(),
      createdByMembership: membershipLabel(asset.createdByMembership, context.dictionary),
      createdAt: String(asset.createdAt),
      updatedByMembership: membershipLabel(asset.createdByMembership, context.dictionary),
      updatedAt: String(asset.updatedAt),
      archivedByMembership: membershipLabel(
        asset.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(asset.archivedAt),
    };
  });
}
