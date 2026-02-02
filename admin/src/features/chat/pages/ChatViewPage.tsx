import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChatView } from 'src/features/chat/components/ChatView';
import { chatPermissions } from 'src/features/chat/chatPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chat.view.title,
  };
}

export default async function ChatViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(chatPermissions.chatRead, context)) {
    redirect('/');
  }

  return <ChatView id={params.id} context={context} />;
}
