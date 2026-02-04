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
      type: enumeratorLabel(
        context.dictionary.asset.enumerators.type,
        asset.type,
      ),
      precision: asset.precision?.toString(),
      isFractional: asset.isFractional
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      meta: asset.meta?.toString(),
      decimals: asset.decimals?.toString(),
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
