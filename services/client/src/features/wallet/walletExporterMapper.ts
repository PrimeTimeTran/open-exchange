import { WalletWithRelationships } from 'src/features/wallet/walletSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function walletExporterMapper(
  wallets: WalletWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return wallets.map((wallet) => {
    return {
      id: wallet.id,
      available: formatDecimal(wallet.available?.toString(), context.locale),
      locked: formatDecimal(wallet.locked?.toString(), context.locale),
      total: formatDecimal(wallet.total?.toString(), context.locale),
      version: wallet.version?.toString(),
      meta: wallet.meta?.toString(),
      createdByMembership: membershipLabel(wallet.createdByMembership, context.dictionary),
      createdAt: String(wallet.createdAt),
      updatedByMembership: membershipLabel(wallet.createdByMembership, context.dictionary),
      updatedAt: String(wallet.updatedAt),
      archivedByMembership: membershipLabel(
        wallet.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(wallet.archivedAt),
    };
  });
}
