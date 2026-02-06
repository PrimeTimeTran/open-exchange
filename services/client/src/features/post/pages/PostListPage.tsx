import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PostList from 'src/features/post/components/PostList';
import { postPermissions } from 'src/features/post/postPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.post.list.title,
  };
}

export default async function PostListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(postPermissions.postRead, context)) {
    return redirect('/');
  }

  return <PostList context={context} />;
}
