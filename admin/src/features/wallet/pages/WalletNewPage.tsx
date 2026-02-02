import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import WalletNew from 'src/features/wallet/components/WalletNew';
import { walletPermissions } from 'src/features/wallet/walletPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.wallet.new.title,
  };
}

export default async function WalletNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(walletPermissions.walletCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.wallet.list.menu, '/wallet'],
          [dictionary.wallet.new.menu],
        ]}
      />
      <div className="my-10">
        <WalletNew context={context} />
      </div>
    </div>
  );
}
