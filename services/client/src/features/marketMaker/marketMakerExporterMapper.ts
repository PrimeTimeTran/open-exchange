import { MarketMakerWithRelationships } from 'src/features/marketMaker/marketMakerSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function marketMakerExporterMapper(
  marketMakers: MarketMakerWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return marketMakers.map((marketMaker) => {
    return {
      id: marketMaker.id,
      organizationName: marketMaker.organizationName,
      contactEmail: marketMaker.contactEmail,
      contactPhone: marketMaker.contactPhone,
      status: enumeratorLabel(
        context.dictionary.marketMaker.enumerators.status,
        marketMaker.status,
      ),
      tier: enumeratorLabel(
        context.dictionary.marketMaker.enumerators.tier,
        marketMaker.tier,
      ),
      marketsSupported: marketMaker.marketsSupported,
      minQuoteSize: marketMaker.minQuoteSize?.toString(),
      maxQuoteSize: marketMaker.maxQuoteSize?.toString(),
      spreadLimit: marketMaker.spreadLimit?.toString(),
      quoteObligation: marketMaker.quoteObligation
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      dailyVolumeTarget: marketMaker.dailyVolumeTarget?.toString(),
      makerFee: marketMaker.makerFee?.toString(),
      takerFee: marketMaker.takerFee?.toString(),
      rebateRate: marketMaker.rebateRate?.toString(),
      rebateBalance: marketMaker.rebateBalance?.toString(),
      apiAccess: marketMaker.apiAccess
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      maxOrdersPerSecond: marketMaker.maxOrdersPerSecond?.toString(),
      directMarketAccess: marketMaker.directMarketAccess
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      contractSignedAt: marketMaker.contractSignedAt ? String(marketMaker.contractSignedAt) : undefined,
      obligationViolationCount: marketMaker.obligationViolationCount?.toString(),
      auditLog: marketMaker.auditLog?.toString(),
      notesInternal: marketMaker.notesInternal,
      specialOrderTypes: enumeratorLabel(
        context.dictionary.marketMaker.enumerators.specialOrderTypes,
        marketMaker.specialOrderTypes,
      ),
      minFeeAmount: formatDecimal(marketMaker.minFeeAmount?.toString(), context.locale),
      createdByMembership: membershipLabel(marketMaker.createdByMembership, context.dictionary),
      createdAt: String(marketMaker.createdAt),
      updatedByMembership: membershipLabel(marketMaker.createdByMembership, context.dictionary),
      updatedAt: String(marketMaker.updatedAt),
      archivedByMembership: membershipLabel(
        marketMaker.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(marketMaker.archivedAt),
    };
  });
}
