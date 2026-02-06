import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UserNotificationList from 'src/features/userNotification/components/UserNotificationList';
import { userNotificationPermissions } from 'src/features/userNotification/userNotificationPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.userNotification.list.title,
  };
}

export default async function UserNotificationListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(userNotificationPermissions.userNotificationRead, context)) {
    return redirect('/');
  }

  return <UserNotificationList context={context} />;
}
