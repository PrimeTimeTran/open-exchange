import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MessageList from 'src/features/message/components/MessageList';
import { messagePermissions } from 'src/features/message/messagePermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.message.list.title,
  };
}

export default async function MessageListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(messagePermissions.messageRead, context)) {
    return redirect('/');
  }

  return <MessageList context={context} />;
}
