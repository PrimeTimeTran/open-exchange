import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import WithdrawalList from 'src/features/withdrawal/components/WithdrawalList';
import { withdrawalPermissions } from 'src/features/withdrawal/withdrawalPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.withdrawal.list.title,
  };
}

export default async function WithdrawalListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(withdrawalPermissions.withdrawalRead, context)) {
    return redirect('/');
  }

  return <WithdrawalList context={context} />;
}
