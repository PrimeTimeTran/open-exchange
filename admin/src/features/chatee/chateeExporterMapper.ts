import { ChateeWithRelationships } from 'src/features/chatee/chateeSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function chateeExporterMapper(
  chatees: ChateeWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return chatees.map((chatee) => {
    return {
      id: chatee.id,
      nickname: chatee.nickname,
      status: enumeratorLabel(
        context.dictionary.chatee.enumerators.status,
        chatee.status,
      ),
      role: chatee.role?.join(', '),
      meta: chatee.meta?.toString(),
      createdByMembership: membershipLabel(chatee.createdByMembership, context.dictionary),
      createdAt: String(chatee.createdAt),
      updatedByMembership: membershipLabel(chatee.createdByMembership, context.dictionary),
      updatedAt: String(chatee.updatedAt),
      archivedByMembership: membershipLabel(
        chatee.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(chatee.archivedAt),
    };
  });
}
