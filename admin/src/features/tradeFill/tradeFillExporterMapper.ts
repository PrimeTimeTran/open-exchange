import { TradeFillWithRelationships } from 'src/features/tradeFill/tradeFillSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function tradeFillExporterMapper(
  tradeFills: TradeFillWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return tradeFills.map((tradeFill) => {
    return {
      id: tradeFill.id,
      side: enumeratorLabel(
        context.dictionary.tradeFill.enumerators.side,
        tradeFill.side,
      ),
      price: formatDecimal(tradeFill.price?.toString(), context.locale),
      quantity: formatDecimal(tradeFill.quantity?.toString(), context.locale),
      fee: formatDecimal(tradeFill.fee?.toString(), context.locale),
      createdByMembership: membershipLabel(tradeFill.createdByMembership, context.dictionary),
      createdAt: String(tradeFill.createdAt),
      updatedByMembership: membershipLabel(tradeFill.createdByMembership, context.dictionary),
      updatedAt: String(tradeFill.updatedAt),
      archivedByMembership: membershipLabel(
        tradeFill.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(tradeFill.archivedAt),
    };
  });
}
