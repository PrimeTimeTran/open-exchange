import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChaterView } from 'src/features/chater/components/ChaterView';
import { chaterPermissions } from 'src/features/chater/chaterPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chater.view.title,
  };
}

export default async function ChaterViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(chaterPermissions.chaterRead, context)) {
    redirect('/');
  }

  return <ChaterView id={params.id} context={context} />;
}
