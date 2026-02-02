import { FeeScheduleWithRelationships } from 'src/features/feeSchedule/feeScheduleSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function feeScheduleExporterMapper(
  feeSchedules: FeeScheduleWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return feeSchedules.map((feeSchedule) => {
    return {
      id: feeSchedule.id,
      scope: enumeratorLabel(
        context.dictionary.feeSchedule.enumerators.scope,
        feeSchedule.scope,
      ),
      makerFeeBps: feeSchedule.makerFeeBps?.toString(),
      takerFeeBps: feeSchedule.takerFeeBps?.toString(),
      minFeeAmount: feeSchedule.minFeeAmount?.toString(),
      effectiveFrom: feeSchedule.effectiveFrom ? String(feeSchedule.effectiveFrom) : undefined,
      effectiveTo: feeSchedule.effectiveTo ? String(feeSchedule.effectiveTo) : undefined,
      tier: feeSchedule.tier,
      accountId: feeSchedule.accountId,
      instrumentId: feeSchedule.instrumentId,
      meta: feeSchedule.meta?.toString(),
      createdByMembership: membershipLabel(feeSchedule.createdByMembership, context.dictionary),
      createdAt: String(feeSchedule.createdAt),
      updatedByMembership: membershipLabel(feeSchedule.createdByMembership, context.dictionary),
      updatedAt: String(feeSchedule.updatedAt),
      archivedByMembership: membershipLabel(
        feeSchedule.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(feeSchedule.archivedAt),
    };
  });
}
