import { WithdrawalWithRelationships } from 'src/features/withdrawal/withdrawalSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function withdrawalExporterMapper(
  withdrawals: WithdrawalWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return withdrawals.map((withdrawal) => {
    return {
      id: withdrawal.id,
      amount: withdrawal.amount?.toString(),
      fee: withdrawal.fee?.toString(),
      status: enumeratorLabel(
        context.dictionary.withdrawal.enumerators.status,
        withdrawal.status,
      ),
      destinationAddress: withdrawal.destinationAddress,
      destinationTag: withdrawal.destinationTag,
      chain: withdrawal.chain,
      txHash: withdrawal.txHash,
      failureReason: withdrawal.failureReason,
      requestedBy: withdrawal.requestedBy,
      approvedBy: withdrawal.approvedBy,
      approvedAt: withdrawal.approvedAt ? String(withdrawal.approvedAt) : undefined,
      requestedAt: withdrawal.requestedAt ? String(withdrawal.requestedAt) : undefined,
      broadcastAt: withdrawal.broadcastAt ? String(withdrawal.broadcastAt) : undefined,
      confirmedAt: withdrawal.confirmedAt ? String(withdrawal.confirmedAt) : undefined,
      confirmations: withdrawal.confirmations?.toString(),
      meta: withdrawal.meta?.toString(),
      createdByMembership: membershipLabel(withdrawal.createdByMembership, context.dictionary),
      createdAt: String(withdrawal.createdAt),
      updatedByMembership: membershipLabel(withdrawal.createdByMembership, context.dictionary),
      updatedAt: String(withdrawal.updatedAt),
      archivedByMembership: membershipLabel(
        withdrawal.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(withdrawal.archivedAt),
    };
  });
}
