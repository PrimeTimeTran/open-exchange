import { FillWithRelationships } from 'src/features/fill/fillSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function fillExporterMapper(
  fills: FillWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return fills.map((fill) => {
    return {
      id: fill.id,
      side: enumeratorLabel(
        context.dictionary.fill.enumerators.side,
        fill.side,
      ),
      price: formatDecimal(fill.price?.toString(), context.locale),
      quantity: formatDecimal(fill.quantity?.toString(), context.locale),
      fee: formatDecimal(fill.fee?.toString(), context.locale),
      meta: fill.meta?.toString(),
      createdByMembership: membershipLabel(fill.createdByMembership, context.dictionary),
      createdAt: String(fill.createdAt),
      updatedByMembership: membershipLabel(fill.createdByMembership, context.dictionary),
      updatedAt: String(fill.updatedAt),
      archivedByMembership: membershipLabel(
        fill.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(fill.archivedAt),
    };
  });
}
