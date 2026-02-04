import { LedgerEntryWithRelationships } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function ledgerEntryExporterMapper(
  ledgerEntries: LedgerEntryWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return ledgerEntries.map((ledgerEntry) => {
    return {
      id: ledgerEntry.id,
      amount: formatDecimal(ledgerEntry.amount?.toString(), context.locale),
      accountId: ledgerEntry.accountId,
      meta: ledgerEntry.meta?.toString(),
      createdByMembership: membershipLabel(ledgerEntry.createdByMembership, context.dictionary),
      createdAt: String(ledgerEntry.createdAt),
      updatedByMembership: membershipLabel(ledgerEntry.createdByMembership, context.dictionary),
      updatedAt: String(ledgerEntry.updatedAt),
      archivedByMembership: membershipLabel(
        ledgerEntry.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(ledgerEntry.archivedAt),
    };
  });
}
