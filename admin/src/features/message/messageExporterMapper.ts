import { MessageWithRelationships } from 'src/features/message/messageSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function messageExporterMapper(
  messages: MessageWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return messages.map((message) => {
    return {
      id: message.id,
      body: message.body,
      type: message.type?.join(', '),
      meta: message.meta?.toString(),
      createdByMembership: membershipLabel(message.createdByMembership, context.dictionary),
      createdAt: String(message.createdAt),
      updatedByMembership: membershipLabel(message.createdByMembership, context.dictionary),
      updatedAt: String(message.updatedAt),
      archivedByMembership: membershipLabel(
        message.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(message.archivedAt),
    };
  });
}
