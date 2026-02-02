import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FillEdit from 'src/features/fill/components/FillEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.fill.edit.title,
  };
}

export default async function FillEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.fillUpdate, context)) {
    return redirect('/');
  }

  return <FillEdit context={context} id={params.id} />;
}
