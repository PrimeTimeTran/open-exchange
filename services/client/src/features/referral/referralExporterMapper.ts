import { ReferralWithRelationships } from 'src/features/referral/referralSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function referralExporterMapper(
  referrals: ReferralWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return referrals.map((referral) => {
    return {
      id: referral.id,
      referrerUserId: referral.referrerUserId,
      referredUserId: referral.referredUserId,
      referralCode: referral.referralCode,
      source: enumeratorLabel(
        context.dictionary.referral.enumerators.source,
        referral.source,
      ),
      status: enumeratorLabel(
        context.dictionary.referral.enumerators.status,
        referral.status,
      ),
      rewardType: enumeratorLabel(
        context.dictionary.referral.enumerators.rewardType,
        referral.rewardType,
      ),
      rewardAmount: referral.rewardAmount?.toString(),
      rewardCurrency: referral.rewardCurrency,
      rewardedAt: referral.rewardedAt ? String(referral.rewardedAt) : undefined,
      meta: referral.meta?.toString(),
      createdByMembership: membershipLabel(referral.createdByMembership, context.dictionary),
      createdAt: String(referral.createdAt),
      updatedByMembership: membershipLabel(referral.createdByMembership, context.dictionary),
      updatedAt: String(referral.updatedAt),
      archivedByMembership: membershipLabel(
        referral.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(referral.archivedAt),
    };
  });
}
