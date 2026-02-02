import { ChatWithRelationships } from 'src/features/chat/chatSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function chatExporterMapper(
  chats: ChatWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return chats.map((chat) => {
    return {
      id: chat.id,
      name: chat.name,
      meta: chat.meta?.toString(),
      active: chat.active
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      createdByMembership: membershipLabel(chat.createdByMembership, context.dictionary),
      createdAt: String(chat.createdAt),
      updatedByMembership: membershipLabel(chat.createdByMembership, context.dictionary),
      updatedAt: String(chat.updatedAt),
      archivedByMembership: membershipLabel(
        chat.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(chat.archivedAt),
    };
  });
}
