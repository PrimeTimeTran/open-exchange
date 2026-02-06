import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UserNotificationEdit from 'src/features/userNotification/components/UserNotificationEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.userNotification.edit.title,
  };
}

export default async function UserNotificationEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.userNotificationUpdate, context)) {
    return redirect('/');
  }

  return <UserNotificationEdit context={context} id={params.id} />;
}
