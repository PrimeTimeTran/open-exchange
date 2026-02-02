import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TradeFillView } from 'src/features/tradeFill/components/TradeFillView';
import { tradeFillPermissions } from 'src/features/tradeFill/tradeFillPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.tradeFill.view.title,
  };
}

export default async function TradeFillViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(tradeFillPermissions.tradeFillRead, context)) {
    redirect('/');
  }

  return <TradeFillView id={params.id} context={context} />;
}
