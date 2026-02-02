import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ArticleNew from 'src/features/article/components/ArticleNew';
import { articlePermissions } from 'src/features/article/articlePermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.article.new.title,
  };
}

export default async function ArticleNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(articlePermissions.articleCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.article.list.menu, '/article'],
          [dictionary.article.new.menu],
        ]}
      />
      <div className="my-10">
        <ArticleNew context={context} />
      </div>
    </div>
  );
}
