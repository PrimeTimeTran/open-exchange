import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MessageView } from 'src/features/message/components/MessageView';
import { messagePermissions } from 'src/features/message/messagePermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.message.view.title,
  };
}

export default async function MessageViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(messagePermissions.messageRead, context)) {
    redirect('/');
  }

  return <MessageView id={params.id} context={context} />;
}
