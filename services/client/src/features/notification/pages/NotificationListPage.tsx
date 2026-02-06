import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NotificationList from 'src/features/notification/components/NotificationList';
import { notificationPermissions } from 'src/features/notification/notificationPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.notification.list.title,
  };
}

export default async function NotificationListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(notificationPermissions.notificationRead, context)) {
    return redirect('/');
  }

  return <NotificationList context={context} />;
}
