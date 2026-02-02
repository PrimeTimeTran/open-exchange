import { ItemWithRelationships } from 'src/features/item/itemSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function itemExporterMapper(
  items: ItemWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return items.map((item) => {
    return {
      id: item.id,
      name: item.name,
      caption: item.caption,
      description: item.description,
      price: formatDecimal(item.price?.toString(), context.locale),
      category: item.category?.join(', '),
      meta: item.meta?.toString(),
      createdByMembership: membershipLabel(item.createdByMembership, context.dictionary),
      createdAt: String(item.createdAt),
      updatedByMembership: membershipLabel(item.createdByMembership, context.dictionary),
      updatedAt: String(item.updatedAt),
      archivedByMembership: membershipLabel(
        item.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(item.archivedAt),
    };
  });
}
