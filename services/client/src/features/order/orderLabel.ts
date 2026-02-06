import { Order } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function orderLabel(order?: Partial<Order> | null, dictionary?: Dictionary) {
  const label = String(order?.id != null ? order.id : '');

  if (!order?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
