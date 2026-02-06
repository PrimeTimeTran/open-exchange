import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MarketMakerNew from 'src/features/marketMaker/components/MarketMakerNew';
import { marketMakerPermissions } from 'src/features/marketMaker/marketMakerPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.marketMaker.new.title,
  };
}

export default async function MarketMakerNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(marketMakerPermissions.marketMakerCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.marketMaker.list.menu, '/market-maker'],
          [dictionary.marketMaker.new.menu],
        ]}
      />
      <div className="my-10">
        <MarketMakerNew context={context} />
      </div>
    </div>
  );
}
