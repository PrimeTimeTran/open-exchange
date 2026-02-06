import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { WithdrawalView } from 'src/features/withdrawal/components/WithdrawalView';
import { withdrawalPermissions } from 'src/features/withdrawal/withdrawalPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.withdrawal.view.title,
  };
}

export default async function WithdrawalViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(withdrawalPermissions.withdrawalRead, context)) {
    redirect('/');
  }

  return <WithdrawalView id={params.id} context={context} />;
}
