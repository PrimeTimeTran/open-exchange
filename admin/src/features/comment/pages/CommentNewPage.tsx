import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CommentNew from 'src/features/comment/components/CommentNew';
import { commentPermissions } from 'src/features/comment/commentPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.comment.new.title,
  };
}

export default async function CommentNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(commentPermissions.commentCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.comment.list.menu, '/comment'],
          [dictionary.comment.new.menu],
        ]}
      />
      <div className="my-10">
        <CommentNew context={context} />
      </div>
    </div>
  );
}
