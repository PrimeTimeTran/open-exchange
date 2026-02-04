import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AccountEdit from 'src/features/account/components/AccountEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.account.edit.title,
  };
}

export default async function AccountEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.accountUpdate, context)) {
    return redirect('/');
  }

  return <AccountEdit context={context} id={params.id} />;
}
