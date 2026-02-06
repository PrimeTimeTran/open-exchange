import { JobWithRelationships } from 'src/features/job/jobSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function jobExporterMapper(
  jobs: JobWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return jobs.map((job) => {
    return {
      id: job.id,
      title: job.title,
      team: job.team,
      location: job.location,
      type: enumeratorLabel(
        context.dictionary.job.enumerators.type,
        job.type,
      ),
      remote: job.remote
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      quantity: job.quantity?.toString(),
      salaryLow: job.salaryLow?.toString(),
      salaryHigh: job.salaryHigh?.toString(),
      status: enumeratorLabel(
        context.dictionary.job.enumerators.status,
        job.status,
      ),
      seniority: enumeratorLabel(
        context.dictionary.job.enumerators.seniority,
        job.seniority,
      ),
      currency: job.currency,
      meta: job.meta?.toString(),
      createdByMembership: membershipLabel(job.createdByMembership, context.dictionary),
      createdAt: String(job.createdAt),
      updatedByMembership: membershipLabel(job.createdByMembership, context.dictionary),
      updatedAt: String(job.updatedAt),
      archivedByMembership: membershipLabel(
        job.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(job.archivedAt),
    };
  });
}
