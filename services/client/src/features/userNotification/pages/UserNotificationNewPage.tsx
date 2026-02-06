import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UserNotificationNew from 'src/features/userNotification/components/UserNotificationNew';
import { userNotificationPermissions } from 'src/features/userNotification/userNotificationPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.userNotification.new.title,
  };
}

export default async function UserNotificationNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(userNotificationPermissions.userNotificationCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.userNotification.list.menu, '/user-notification'],
          [dictionary.userNotification.new.menu],
        ]}
      />
      <div className="my-10">
        <UserNotificationNew context={context} />
      </div>
    </div>
  );
}
