import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { WalletView } from 'src/features/wallet/components/WalletView';
import { walletPermissions } from 'src/features/wallet/walletPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.wallet.view.title,
  };
}

export default async function WalletViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(walletPermissions.walletRead, context)) {
    redirect('/');
  }

  return <WalletView id={params.id} context={context} />;
}
