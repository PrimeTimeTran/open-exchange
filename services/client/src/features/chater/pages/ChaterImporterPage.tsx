import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChaterImporter } from 'src/features/chater/components/ChaterImporter';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.shared.importer.title,
  };
}

export default async function ChaterImporterPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.chaterImport, context)) {
    return redirect('/');
  }

  return <ChaterImporter context={context} />;
}
