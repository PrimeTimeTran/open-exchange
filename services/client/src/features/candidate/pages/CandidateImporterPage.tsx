import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CandidateImporter } from 'src/features/candidate/components/CandidateImporter';
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

export default async function CandidateImporterPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.candidateImport, context)) {
    return redirect('/');
  }

  return <CandidateImporter context={context} />;
}
