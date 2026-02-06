import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChatList from 'src/features/chat/components/ChatList';
import { chatPermissions } from 'src/features/chat/chatPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chat.list.title,
  };
}

export default async function ChatListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(chatPermissions.chatRead, context)) {
    return redirect('/');
  }

  return <ChatList context={context} />;
}
