import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChateeView } from 'src/features/chatee/components/ChateeView';
import { chateePermissions } from 'src/features/chatee/chateePermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chatee.view.title,
  };
}

export default async function ChateeViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(chateePermissions.chateeRead, context)) {
    redirect('/');
  }

  return <ChateeView id={params.id} context={context} />;
}
