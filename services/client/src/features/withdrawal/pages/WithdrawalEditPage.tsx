import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import WithdrawalEdit from 'src/features/withdrawal/components/WithdrawalEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.withdrawal.edit.title,
  };
}

export default async function WithdrawalEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.withdrawalUpdate, context)) {
    return redirect('/');
  }

  return <WithdrawalEdit context={context} id={params.id} />;
}
