import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DepositView } from 'src/features/deposit/components/DepositView';
import { depositPermissions } from 'src/features/deposit/depositPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.deposit.view.title,
  };
}

export default async function DepositViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(depositPermissions.depositRead, context)) {
    redirect('/');
  }

  return <DepositView id={params.id} context={context} />;
}
