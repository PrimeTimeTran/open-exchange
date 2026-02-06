import { ChaterWithRelationships } from 'src/features/chater/chaterSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function chaterExporterMapper(
  chaters: ChaterWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return chaters.map((chater) => {
    return {
      id: chater.id,
      nickname: chater.nickname,
      status: enumeratorLabel(
        context.dictionary.chater.enumerators.status,
        chater.status,
      ),
      role: chater.role?.join(', '),
      meta: chater.meta?.toString(),
      createdByMembership: membershipLabel(chater.createdByMembership, context.dictionary),
      createdAt: String(chater.createdAt),
      updatedByMembership: membershipLabel(chater.createdByMembership, context.dictionary),
      updatedAt: String(chater.updatedAt),
      archivedByMembership: membershipLabel(
        chater.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(chater.archivedAt),
    };
  });
}
