import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TradeEdit from 'src/features/trade/components/TradeEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.trade.edit.title,
  };
}

export default async function TradeEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.tradeUpdate, context)) {
    return redirect('/');
  }

  return <TradeEdit context={context} id={params.id} />;
}
