import { AccountWithRelationships } from 'src/features/account/accountSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function accountExporterMapper(
  accounts: AccountWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return accounts.map((account) => {
    return {
      id: account.id,
      name: account.name,
      isSystem: account.isSystem
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      type: enumeratorLabel(
        context.dictionary.account.enumerators.type,
        account.type,
      ),
      status: enumeratorLabel(
        context.dictionary.account.enumerators.status,
        account.status,
      ),
      isInterest: account.isInterest
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      interestRate: formatDecimal(account.interestRate?.toString(), context.locale),
      meta: account.meta?.toString(),
      createdByMembership: membershipLabel(account.createdByMembership, context.dictionary),
      createdAt: String(account.createdAt),
      updatedByMembership: membershipLabel(account.createdByMembership, context.dictionary),
      updatedAt: String(account.updatedAt),
      archivedByMembership: membershipLabel(
        account.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(account.archivedAt),
    };
  });
}
