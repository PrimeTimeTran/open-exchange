import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NotificationView } from 'src/features/notification/components/NotificationView';
import { notificationPermissions } from 'src/features/notification/notificationPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.notification.view.title,
  };
}

export default async function NotificationViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(notificationPermissions.notificationRead, context)) {
    redirect('/');
  }

  return <NotificationView id={params.id} context={context} />;
}
