import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TradeFillList from 'src/features/tradeFill/components/TradeFillList';
import { tradeFillPermissions } from 'src/features/tradeFill/tradeFillPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.tradeFill.list.title,
  };
}

export default async function TradeFillListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(tradeFillPermissions.tradeFillRead, context)) {
    return redirect('/');
  }

  return <TradeFillList context={context} />;
}
