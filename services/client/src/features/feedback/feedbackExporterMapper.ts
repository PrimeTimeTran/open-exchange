import { FeedbackWithRelationships } from 'src/features/feedback/feedbackSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function feedbackExporterMapper(
  feedbacks: FeedbackWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return feedbacks.map((feedback) => {
    return {
      id: feedback.id,
      title: feedback.title,
      description: feedback.description,
      type: enumeratorLabel(
        context.dictionary.feedback.enumerators.type,
        feedback.type,
      ),
      status: enumeratorLabel(
        context.dictionary.feedback.enumerators.status,
        feedback.status,
      ),
      json: feedback.json?.toString(),
      createdByMembership: membershipLabel(feedback.createdByMembership, context.dictionary),
      createdAt: String(feedback.createdAt),
      updatedByMembership: membershipLabel(feedback.createdByMembership, context.dictionary),
      updatedAt: String(feedback.updatedAt),
      archivedByMembership: membershipLabel(
        feedback.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(feedback.archivedAt),
    };
  });
}
