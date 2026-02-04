import { OrderWithRelationships } from 'src/features/order/orderSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function orderExporterMapper(
  orders: OrderWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return orders.map((order) => {
    return {
      id: order.id,
      side: enumeratorLabel(
        context.dictionary.order.enumerators.side,
        order.side,
      ),
      type: enumeratorLabel(
        context.dictionary.order.enumerators.type,
        order.type,
      ),
      price: formatDecimal(order.price?.toString(), context.locale),
      quantity: formatDecimal(order.quantity?.toString(), context.locale),
      quantityFilled: formatDecimal(order.quantityFilled?.toString(), context.locale),
      status: enumeratorLabel(
        context.dictionary.order.enumerators.status,
        order.status,
      ),
      timeInFore: enumeratorLabel(
        context.dictionary.order.enumerators.timeInFore,
        order.timeInFore,
      ),
      meta: order.meta?.toString(),
      createdByMembership: membershipLabel(order.createdByMembership, context.dictionary),
      createdAt: String(order.createdAt),
      updatedByMembership: membershipLabel(order.createdByMembership, context.dictionary),
      updatedAt: String(order.updatedAt),
      archivedByMembership: membershipLabel(
        order.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(order.archivedAt),
    };
  });
}
