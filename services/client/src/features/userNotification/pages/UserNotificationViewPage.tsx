import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserNotificationView } from 'src/features/userNotification/components/UserNotificationView';
import { userNotificationPermissions } from 'src/features/userNotification/userNotificationPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.userNotification.view.title,
  };
}

export default async function UserNotificationViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(userNotificationPermissions.userNotificationRead, context)) {
    redirect('/');
  }

  return <UserNotificationView id={params.id} context={context} />;
}
