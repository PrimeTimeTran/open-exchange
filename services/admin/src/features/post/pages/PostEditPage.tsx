import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PostEdit from 'src/features/post/components/PostEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.post.edit.title,
  };
}

export default async function PostEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.postUpdate, context)) {
    return redirect('/');
  }

  return <PostEdit context={context} id={params.id} />;
}
