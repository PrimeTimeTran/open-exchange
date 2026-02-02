import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CommentEdit from 'src/features/comment/components/CommentEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.comment.edit.title,
  };
}

export default async function CommentEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.commentUpdate, context)) {
    return redirect('/');
  }

  return <CommentEdit context={context} id={params.id} />;
}
