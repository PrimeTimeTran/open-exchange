import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TradeView } from 'src/features/trade/components/TradeView';
import { tradePermissions } from 'src/features/trade/tradePermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.trade.view.title,
  };
}

export default async function TradeViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(tradePermissions.tradeRead, context)) {
    redirect('/');
  }

  return <TradeView id={params.id} context={context} />;
}
