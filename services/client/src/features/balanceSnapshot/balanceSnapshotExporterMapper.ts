import { BalanceSnapshotWithRelationships } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function balanceSnapshotExporterMapper(
  balanceSnapshots: BalanceSnapshotWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return balanceSnapshots.map((balanceSnapshot) => {
    return {
      id: balanceSnapshot.id,
      available: balanceSnapshot.available?.toString(),
      locked: balanceSnapshot.locked?.toString(),
      total: balanceSnapshot.total?.toString(),
      snapshotAt: balanceSnapshot.snapshotAt ? String(balanceSnapshot.snapshotAt) : undefined,
      meta: balanceSnapshot.meta?.toString(),
      createdByMembership: membershipLabel(balanceSnapshot.createdByMembership, context.dictionary),
      createdAt: String(balanceSnapshot.createdAt),
      updatedByMembership: membershipLabel(balanceSnapshot.createdByMembership, context.dictionary),
      updatedAt: String(balanceSnapshot.updatedAt),
      archivedByMembership: membershipLabel(
        balanceSnapshot.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(balanceSnapshot.archivedAt),
    };
  });
}
