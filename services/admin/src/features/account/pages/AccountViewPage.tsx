import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AccountView } from 'src/features/account/components/AccountView';
import { accountPermissions } from 'src/features/account/accountPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.account.view.title,
  };
}

export default async function AccountViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(accountPermissions.accountRead, context)) {
    redirect('/');
  }

  return <AccountView id={params.id} context={context} />;
}
