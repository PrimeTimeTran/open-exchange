import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ArticleEdit from 'src/features/article/components/ArticleEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.article.edit.title,
  };
}

export default async function ArticleEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.articleUpdate, context)) {
    return redirect('/');
  }

  return <ArticleEdit context={context} id={params.id} />;
}
