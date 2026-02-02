import { TradeWithRelationships } from 'src/features/trade/tradeSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function tradeExporterMapper(
  trades: TradeWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return trades.map((trade) => {
    return {
      id: trade.id,
      price: formatDecimal(trade.price?.toString(), context.locale),
      quantity: formatDecimal(trade.quantity?.toString(), context.locale),
      meta: trade.meta?.toString(),
      createdByMembership: membershipLabel(trade.createdByMembership, context.dictionary),
      createdAt: String(trade.createdAt),
      updatedByMembership: membershipLabel(trade.createdByMembership, context.dictionary),
      updatedAt: String(trade.updatedAt),
      archivedByMembership: membershipLabel(
        trade.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(trade.archivedAt),
    };
  });
}
