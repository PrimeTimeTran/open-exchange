import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SystemAccountList from 'src/features/systemAccount/components/SystemAccountList';
import { systemAccountPermissions } from 'src/features/systemAccount/systemAccountPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.systemAccount.list.title,
  };
}

export default async function SystemAccountListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(systemAccountPermissions.systemAccountRead, context)) {
    return redirect('/');
  }

  return <SystemAccountList context={context} />;
}
