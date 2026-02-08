import { DepositWithRelationships } from 'src/features/deposit/depositSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function depositExporterMapper(
  deposits: DepositWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return deposits.map((deposit) => {
    return {
      id: deposit.id,
      amount: formatDecimal(deposit.amount?.toString(), context.locale),
      status: enumeratorLabel(
        context.dictionary.deposit.enumerators.status,
        deposit.status,
      ),
      chain: deposit.chain,
      txHash: deposit.txHash,
      fromAddress: deposit.fromAddress,
      confirmations: deposit.confirmations?.toString(),
      requiredConfirmations: deposit.requiredConfirmations?.toString(),
      detectedAt: deposit.detectedAt ? String(deposit.detectedAt) : undefined,
      confirmedAt: deposit.confirmedAt ? String(deposit.confirmedAt) : undefined,
      creditedAt: deposit.creditedAt ? String(deposit.creditedAt) : undefined,
      meta: deposit.meta?.toString(),
      createdByMembership: membershipLabel(deposit.createdByMembership, context.dictionary),
      createdAt: String(deposit.createdAt),
      updatedByMembership: membershipLabel(deposit.createdByMembership, context.dictionary),
      updatedAt: String(deposit.updatedAt),
      archivedByMembership: membershipLabel(
        deposit.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(deposit.archivedAt),
    };
  });
}
