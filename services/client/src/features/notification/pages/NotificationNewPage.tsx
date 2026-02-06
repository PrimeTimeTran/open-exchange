import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NotificationNew from 'src/features/notification/components/NotificationNew';
import { notificationPermissions } from 'src/features/notification/notificationPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.notification.new.title,
  };
}

export default async function NotificationNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(notificationPermissions.notificationCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.notification.list.menu, '/notification'],
          [dictionary.notification.new.menu],
        ]}
      />
      <div className="my-10">
        <NotificationNew context={context} />
      </div>
    </div>
  );
}
