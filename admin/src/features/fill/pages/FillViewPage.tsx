import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FillView } from 'src/features/fill/components/FillView';
import { fillPermissions } from 'src/features/fill/fillPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.fill.view.title,
  };
}

export default async function FillViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(fillPermissions.fillRead, context)) {
    redirect('/');
  }

  return <FillView id={params.id} context={context} />;
}
