import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import WalletEdit from 'src/features/wallet/components/WalletEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.wallet.edit.title,
  };
}

export default async function WalletEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.walletUpdate, context)) {
    return redirect('/');
  }

  return <WalletEdit context={context} id={params.id} />;
}
