import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MessageEdit from 'src/features/message/components/MessageEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.message.edit.title,
  };
}

export default async function MessageEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.messageUpdate, context)) {
    return redirect('/');
  }

  return <MessageEdit context={context} id={params.id} />;
}
