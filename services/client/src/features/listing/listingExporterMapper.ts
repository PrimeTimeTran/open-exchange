import { ListingWithRelationships } from 'src/features/listing/listingSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function listingExporterMapper(
  listings: ListingWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return listings.map((listing) => {
    return {
      id: listing.id,
      companyName: listing.companyName,
      legalName: listing.legalName,
      jurisdiction: listing.jurisdiction,
      incorporationDate: listing.incorporationDate ? String(listing.incorporationDate).split('T')[0]: undefined,
      website: listing.website,
      assetSymbol: listing.assetSymbol,
      assetClass: enumeratorLabel(
        context.dictionary.listing.enumerators.assetClass,
        listing.assetClass,
      ),
      status: enumeratorLabel(
        context.dictionary.listing.enumerators.status,
        listing.status,
      ),
      submittedAt: listing.submittedAt ? String(listing.submittedAt).split('T')[0]: undefined,
      decisionAt: listing.decisionAt ? String(listing.decisionAt).split('T')[0]: undefined,
      kycCompleted: listing.kycCompleted
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      docsSubmitted: listing.docsSubmitted
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      riskDisclosureUrl: listing.riskDisclosureUrl,
      primaryContactName: listing.primaryContactName,
      primaryContactEmail: listing.primaryContactEmail,
      reviewedBy: listing.reviewedBy,
      notes: listing.notes,
      meta: listing.meta?.toString(),
      createdByMembership: membershipLabel(listing.createdByMembership, context.dictionary),
      createdAt: String(listing.createdAt),
      updatedByMembership: membershipLabel(listing.createdByMembership, context.dictionary),
      updatedAt: String(listing.updatedAt),
      archivedByMembership: membershipLabel(
        listing.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(listing.archivedAt),
    };
  });
}
