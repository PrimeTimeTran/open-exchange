import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChateeEdit from 'src/features/chatee/components/ChateeEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chatee.edit.title,
  };
}

export default async function ChateeEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.chateeUpdate, context)) {
    return redirect('/');
  }

  return <ChateeEdit context={context} id={params.id} />;
}
