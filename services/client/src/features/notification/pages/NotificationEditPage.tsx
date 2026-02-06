import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NotificationEdit from 'src/features/notification/components/NotificationEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.notification.edit.title,
  };
}

export default async function NotificationEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.notificationUpdate, context)) {
    return redirect('/');
  }

  return <NotificationEdit context={context} id={params.id} />;
}
