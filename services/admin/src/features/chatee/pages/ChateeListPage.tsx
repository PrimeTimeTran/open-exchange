import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChateeList from 'src/features/chatee/components/ChateeList';
import { chateePermissions } from 'src/features/chatee/chateePermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chatee.list.title,
  };
}

export default async function ChateeListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(chateePermissions.chateeRead, context)) {
    return redirect('/');
  }

  return <ChateeList context={context} />;
}
