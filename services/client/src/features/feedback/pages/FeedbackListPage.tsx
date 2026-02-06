import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FeedbackList from 'src/features/feedback/components/FeedbackList';
import { feedbackPermissions } from 'src/features/feedback/feedbackPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.feedback.list.title,
  };
}

export default async function FeedbackListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(feedbackPermissions.feedbackRead, context)) {
    return redirect('/');
  }

  return <FeedbackList context={context} />;
}
