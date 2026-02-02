import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DepositList from 'src/features/deposit/components/DepositList';
import { depositPermissions } from 'src/features/deposit/depositPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.deposit.list.title,
  };
}

export default async function DepositListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(depositPermissions.depositRead, context)) {
    return redirect('/');
  }

  return <DepositList context={context} />;
}
