import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MarketMakerList from 'src/features/marketMaker/components/MarketMakerList';
import { marketMakerPermissions } from 'src/features/marketMaker/marketMakerPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.marketMaker.list.title,
  };
}

export default async function MarketMakerListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(marketMakerPermissions.marketMakerRead, context)) {
    return redirect('/');
  }

  return <MarketMakerList context={context} />;
}
