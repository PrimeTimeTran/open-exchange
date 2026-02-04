import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import WalletList from 'src/features/wallet/components/WalletList';
import { walletPermissions } from 'src/features/wallet/walletPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.wallet.list.title,
  };
}

export default async function WalletListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(walletPermissions.walletRead, context)) {
    return redirect('/');
  }

  return <WalletList context={context} />;
}
