import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChaterList from 'src/features/chater/components/ChaterList';
import { chaterPermissions } from 'src/features/chater/chaterPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chater.list.title,
  };
}

export default async function ChaterListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(chaterPermissions.chaterRead, context)) {
    return redirect('/');
  }

  return <ChaterList context={context} />;
}
