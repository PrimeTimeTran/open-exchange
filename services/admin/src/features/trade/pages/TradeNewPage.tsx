import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TradeNew from 'src/features/trade/components/TradeNew';
import { tradePermissions } from 'src/features/trade/tradePermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.trade.new.title,
  };
}

export default async function TradeNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(tradePermissions.tradeCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.trade.list.menu, '/trade'],
          [dictionary.trade.new.menu],
        ]}
      />
      <div className="my-10">
        <TradeNew context={context} />
      </div>
    </div>
  );
}
