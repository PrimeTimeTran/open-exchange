import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CommentView } from 'src/features/comment/components/CommentView';
import { commentPermissions } from 'src/features/comment/commentPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.comment.view.title,
  };
}

export default async function CommentViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(commentPermissions.commentRead, context)) {
    redirect('/');
  }

  return <CommentView id={params.id} context={context} />;
}
