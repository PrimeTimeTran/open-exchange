import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FeedbackEdit from 'src/features/feedback/components/FeedbackEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.feedback.edit.title,
  };
}

export default async function FeedbackEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.feedbackUpdate, context)) {
    return redirect('/');
  }

  return <FeedbackEdit context={context} id={params.id} />;
}
