import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SystemAccountNew from 'src/features/systemAccount/components/SystemAccountNew';
import { systemAccountPermissions } from 'src/features/systemAccount/systemAccountPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.systemAccount.new.title,
  };
}

export default async function SystemAccountNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(systemAccountPermissions.systemAccountCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.systemAccount.list.menu, '/system-account'],
          [dictionary.systemAccount.new.menu],
        ]}
      />
      <div className="my-10">
        <SystemAccountNew context={context} />
      </div>
    </div>
  );
}
