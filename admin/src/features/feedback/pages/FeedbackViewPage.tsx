import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FeedbackView } from 'src/features/feedback/components/FeedbackView';
import { feedbackPermissions } from 'src/features/feedback/feedbackPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.feedback.view.title,
  };
}

export default async function FeedbackViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(feedbackPermissions.feedbackRead, context)) {
    redirect('/');
  }

  return <FeedbackView id={params.id} context={context} />;
}
