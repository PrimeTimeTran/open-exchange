import { InstrumentWithRelationships } from 'src/features/instrument/instrumentSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function instrumentExporterMapper(
  instruments: InstrumentWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return instruments.map((instrument) => {
    return {
      id: instrument.id,
      symbol: instrument.symbol,
      type: enumeratorLabel(
        context.dictionary.instrument.enumerators.type,
        instrument.type,
      ),
      status: enumeratorLabel(
        context.dictionary.instrument.enumerators.status,
        instrument.status,
      ),
      meta: instrument.meta?.toString(),
      createdByMembership: membershipLabel(instrument.createdByMembership, context.dictionary),
      createdAt: String(instrument.createdAt),
      updatedByMembership: membershipLabel(instrument.createdByMembership, context.dictionary),
      updatedAt: String(instrument.updatedAt),
      archivedByMembership: membershipLabel(
        instrument.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(instrument.archivedAt),
    };
  });
}
