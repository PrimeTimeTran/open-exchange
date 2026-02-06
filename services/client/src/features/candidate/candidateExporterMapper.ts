import { CandidateWithRelationships } from 'src/features/candidate/candidateSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function candidateExporterMapper(
  candidates: CandidateWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return candidates.map((candidate) => {
    return {
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      preferredName: candidate.preferredName,
      email: candidate.email,
      phone: candidate.phone,
      country: candidate.country,
      timezone: candidate.timezone,
      linkedinUrl: candidate.linkedinUrl,
      githubUrl: candidate.githubUrl,
      portfolioUrl: candidate.portfolioUrl,
      resumeUrl: candidate.resumeUrl,
      meta: candidate.meta?.toString(),
      createdByMembership: membershipLabel(candidate.createdByMembership, context.dictionary),
      createdAt: String(candidate.createdAt),
      updatedByMembership: membershipLabel(candidate.createdByMembership, context.dictionary),
      updatedAt: String(candidate.updatedAt),
      archivedByMembership: membershipLabel(
        candidate.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(candidate.archivedAt),
    };
  });
}
