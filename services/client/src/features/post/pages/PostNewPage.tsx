import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PostNew from 'src/features/post/components/PostNew';
import { postPermissions } from 'src/features/post/postPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.post.new.title,
  };
}

export default async function PostNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(postPermissions.postCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.post.list.menu, '/post'],
          [dictionary.post.new.menu],
        ]}
      />
      <div className="my-10">
        <PostNew context={context} />
      </div>
    </div>
  );
}
