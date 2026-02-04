import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChatEdit from 'src/features/chat/components/ChatEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chat.edit.title,
  };
}

export default async function ChatEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.chatUpdate, context)) {
    return redirect('/');
  }

  return <ChatEdit context={context} id={params.id} />;
}
