import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArticleView } from 'src/features/article/components/ArticleView';
import { articlePermissions } from 'src/features/article/articlePermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.article.view.title,
  };
}

export default async function ArticleViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(articlePermissions.articleRead, context)) {
    redirect('/');
  }

  return <ArticleView id={params.id} context={context} />;
}
