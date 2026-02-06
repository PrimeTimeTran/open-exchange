import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MarketMakerEdit from 'src/features/marketMaker/components/MarketMakerEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.marketMaker.edit.title,
  };
}

export default async function MarketMakerEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.marketMakerUpdate, context)) {
    return redirect('/');
  }

  return <MarketMakerEdit context={context} id={params.id} />;
}
