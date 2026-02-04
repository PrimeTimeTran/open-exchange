import { LedgerEventWithRelationships } from 'src/features/ledgerEvent/ledgerEventSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function ledgerEventExporterMapper(
  ledgerEvents: LedgerEventWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return ledgerEvents.map((ledgerEvent) => {
    return {
      id: ledgerEvent.id,
      type: enumeratorLabel(
        context.dictionary.ledgerEvent.enumerators.type,
        ledgerEvent.type,
      ),
      referenceId: ledgerEvent.referenceId,
      referenceType: enumeratorLabel(
        context.dictionary.ledgerEvent.enumerators.referenceType,
        ledgerEvent.referenceType,
      ),
      status: enumeratorLabel(
        context.dictionary.ledgerEvent.enumerators.status,
        ledgerEvent.status,
      ),
      description: ledgerEvent.description,
      meta: ledgerEvent.meta?.toString(),
      createdByMembership: membershipLabel(ledgerEvent.createdByMembership, context.dictionary),
      createdAt: String(ledgerEvent.createdAt),
      updatedByMembership: membershipLabel(ledgerEvent.createdByMembership, context.dictionary),
      updatedAt: String(ledgerEvent.updatedAt),
      archivedByMembership: membershipLabel(
        ledgerEvent.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(ledgerEvent.archivedAt),
    };
  });
}
