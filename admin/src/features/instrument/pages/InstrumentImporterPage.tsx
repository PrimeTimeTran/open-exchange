import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { InstrumentImporter } from 'src/features/instrument/components/InstrumentImporter';
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

export default async function InstrumentImporterPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.instrumentImport, context)) {
    return redirect('/');
  }

  return <InstrumentImporter context={context} />;
}
