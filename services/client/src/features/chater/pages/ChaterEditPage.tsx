import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChaterEdit from 'src/features/chater/components/ChaterEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chater.edit.title,
  };
}

export default async function ChaterEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.chaterUpdate, context)) {
    return redirect('/');
  }

  return <ChaterEdit context={context} id={params.id} />;
}
