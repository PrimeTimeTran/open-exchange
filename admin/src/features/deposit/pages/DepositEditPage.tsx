import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DepositEdit from 'src/features/deposit/components/DepositEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.deposit.edit.title,
  };
}

export default async function DepositEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.depositUpdate, context)) {
    return redirect('/');
  }

  return <DepositEdit context={context} id={params.id} />;
}
