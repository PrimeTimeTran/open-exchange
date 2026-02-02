import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CommentList from 'src/features/comment/components/CommentList';
import { commentPermissions } from 'src/features/comment/commentPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.comment.list.title,
  };
}

export default async function CommentListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(commentPermissions.commentRead, context)) {
    return redirect('/');
  }

  return <CommentList context={context} />;
}
