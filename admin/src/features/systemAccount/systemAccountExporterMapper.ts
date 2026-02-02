import { SystemAccountWithRelationships } from 'src/features/systemAccount/systemAccountSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function systemAccountExporterMapper(
  systemAccounts: SystemAccountWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return systemAccounts.map((systemAccount) => {
    return {
      id: systemAccount.id,
      type: enumeratorLabel(
        context.dictionary.systemAccount.enumerators.type,
        systemAccount.type,
      ),
      name: systemAccount.name,
      description: systemAccount.description,
      isActive: systemAccount.isActive
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      meta: systemAccount.meta?.toString(),
      createdByMembership: membershipLabel(systemAccount.createdByMembership, context.dictionary),
      createdAt: String(systemAccount.createdAt),
      updatedByMembership: membershipLabel(systemAccount.createdByMembership, context.dictionary),
      updatedAt: String(systemAccount.updatedAt),
      archivedByMembership: membershipLabel(
        systemAccount.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(systemAccount.archivedAt),
    };
  });
}
