import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArticleImporter } from 'src/features/article/components/ArticleImporter';
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

export default async function ArticleImporterPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.articleImport, context)) {
    return redirect('/');
  }

  return <ArticleImporter context={context} />;
}
